const { Invoice, InvoiceItem, Product, Warehouse, Supplier, OtherSource, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Generate unique invoice number
const generateInvoiceNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  const prefix = `INV-${year}${month}${day}`;
  
  // Find the last invoice for today
  const lastInvoice = await Invoice.findOne({
    where: {
      invoice_number: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['invoice_number', 'DESC']]
  });
  
  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoice_number.split('-')[2]) || 0;
    sequence = lastSequence + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// Calculate invoice totals
const calculateInvoiceTotals = (items) => {
  let totalAmount = 0;
  
  items.forEach(item => {
    const lineTotal = (parseFloat(item.price) * parseFloat(item.quantity)) - parseFloat(item.discount_amount || 0);
    totalAmount += lineTotal;
  });
  
  return {
    total_amount: totalAmount.toFixed(2)
  };
};

const getAllInvoices = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get search parameter
    const search = req.query.search;
    
    // Get date range parameters
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    // Get warehouse filter parameter
    const warehouseId = req.query.warehouseId;
    
    // Get supplier filter parameter
    const supplierId = req.query.supplierId;
    
    // Get sort parameters
    const sortField = req.query.sortField || 'id';
    const sortDirection = req.query.sortDirection || 'DESC';

    // Build where clause for search and filters
    let whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { invoice_number: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (startDate && endDate) {
      whereClause.invoice_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.invoice_date = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.invoice_date = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    if (warehouseId) {
      whereClause.warehouse_id = warehouseId;
    }
    
    if (supplierId) {
      whereClause.supplier_id = supplierId;
    }

    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['id', 'invoice_number', 'invoice_date', 'total_amount'];
    const validSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
    const validSortDirection = ['ASC', 'DESC'].includes(sortDirection.toUpperCase()) ? sortDirection.toUpperCase() : 'DESC';

    // Get total count for pagination metadata
    const totalCount = await Invoice.count({ where: whereClause });
    
    // Fetch invoices with pagination, search, filtering, and sorting
    const invoices = await Invoice.findAll({
      where: whereClause,
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        },
        {
          model: OtherSource,
          as: 'otherSource',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name']
        }
      ],
      limit: limit,
      offset: offset,
      order: [[validSortField, validSortDirection]]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      data: invoices,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      date: invoiceDate, 
      warehouse_id, 
      supplier_id, 
      other_source_id, 
      products, 
      commentary: description 
    } = req.body;
    
    const user_id = req.user.id; // Assuming user is set in middleware

    // Validate that either supplier_id or other_source_id is provided
    if (!supplier_id && !other_source_id) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Supplier yoki Other Source dan biri tanlanishi kerak' 
      });
    }

    if (supplier_id && other_source_id) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Faqat bitta manbani tanlash mumkin (Supplier yoki Other Source)' 
      });
    }

    // Validate warehouse exists
    const warehouse = await Warehouse.findByPk(warehouse_id);
    if (!warehouse) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    // Validate supplier or other source exists
    if (supplier_id) {
      const supplier = await Supplier.findByPk(supplier_id);
      if (!supplier) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Supplier not found' });
      }
    }

    if (other_source_id) {
      const otherSource = await OtherSource.findByPk(other_source_id);
      if (!otherSource) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Other Source not found' });
      }
    }

    // Validate products
    const productIds = products.map(p => p.product_id);
    const existingProducts = await Product.findAll({
      where: { id: { [Op.in]: productIds } }
    });

    if (existingProducts.length !== productIds.length) {
      await transaction.rollback();
      return res.status(404).json({ error: 'One or more products not found' });
    }

    // Generate invoice number
    const invoice_number = await generateInvoiceNumber();

    // Calculate totals
    const { total_amount } = calculateInvoiceTotals(products);

    // Create invoice
    const invoice = await Invoice.create({
      invoice_number,
      invoice_date: invoiceDate || new Date(),
      warehouse_id,
      supplier_id: supplier_id || null,
      other_source_id: other_source_id || null,
      total_amount,
      description,
      user_id
    }, { transaction });

    // Create invoice items
    const invoiceItems = [];
    for (const productData of products) {
      const {
        product_id,
        quantity,
        price,
        discount_percentage = 0,
        discount_amount = 0,
        exchange_rate = null
      } = productData;

      const invoiceItem = await InvoiceItem.create({
        invoice_id: invoice.id,
        product_id,
        quantity,
        price,
        discount_percentage,
        discount_amount,
        exchange_rate
      }, { transaction });

      invoiceItems.push(invoiceItem);
    }

    // Fetch the created invoice with all associations before committing
    const createdInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        },
        {
          model: OtherSource,
          as: 'otherSource',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: InvoiceItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unit']
            }
          ]
        }
      ]
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Invoice muvaffaqiyatli yaratildi',
      data: createdInvoice
    });
  } catch (error) {
    // Only rollback if transaction hasn't been committed yet
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res.status(500).json({ error: error.message });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        },
        {
          model: OtherSource,
          as: 'otherSource',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: InvoiceItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unit']
            }
          ]
        }
      ]
    });

    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const invoiceId = req.params.id;
    const { 
      date: invoiceDate, 
      warehouse_id, 
      supplier_id, 
      other_source_id, 
      products, 
      commentary: description 
    } = req.body;

    // Find existing invoice
    const existingInvoice = await Invoice.findByPk(invoiceId);
    if (!existingInvoice) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Validate that either supplier_id or other_source_id is provided
    if (!supplier_id && !other_source_id) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Supplier yoki Other Source dan biri tanlanishi kerak' 
      });
    }

    if (supplier_id && other_source_id) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Faqat bitta manbani tanlash mumkin (Supplier yoki Other Source)' 
      });
    }

    // Validate products
    const productIds = products.map(p => p.product_id);
    const existingProducts = await Product.findAll({
      where: { id: { [Op.in]: productIds } }
    });

    if (existingProducts.length !== productIds.length) {
      await transaction.rollback();
      return res.status(404).json({ error: 'One or more products not found' });
    }

    // Calculate totals
    const { total_amount } = calculateInvoiceTotals(products);

    // Update invoice
    await Invoice.update({
      invoice_date: invoiceDate || existingInvoice.invoice_date,
      warehouse_id,
      supplier_id: supplier_id || null,
      other_source_id: other_source_id || null,
      total_amount,
      description
    }, {
      where: { id: invoiceId },
      transaction
    });

    // Delete existing invoice items
    await InvoiceItem.destroy({
      where: { invoice_id: invoiceId },
      transaction
    });

    // Create new invoice items
    for (const productData of products) {
      const {
        product_id,
        quantity,
        price,
        discount_percentage = 0,
        discount_amount = 0,
        exchange_rate = null
      } = productData;

      await InvoiceItem.create({
        invoice_id: invoiceId,
        product_id,
        quantity,
        price,
        discount_percentage,
        discount_amount,
        exchange_rate
      }, { transaction });
    }

    await transaction.commit();

    // Fetch the updated invoice with all associations
    const updatedInvoice = await Invoice.findByPk(invoiceId, {
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        },
        {
          model: OtherSource,
          as: 'otherSource',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: InvoiceItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unit']
            }
          ]
        }
      ]
    });

    res.json({
      message: 'Invoice muvaffaqiyatli yangilandi',
      data: updatedInvoice
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

const deleteInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const invoiceId = req.params.id;

    // Find existing invoice
    const existingInvoice = await Invoice.findByPk(invoiceId);
    if (!existingInvoice) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete invoice items first (cascade should handle this, but explicit is better)
    await InvoiceItem.destroy({
      where: { invoice_id: invoiceId },
      transaction
    });

    // Delete invoice
    await Invoice.destroy({
      where: { id: invoiceId },
      transaction
    });

    await transaction.commit();

    res.json({ message: 'Invoice muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
};
