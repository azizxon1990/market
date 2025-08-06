const { validationResult, body } = require('express-validator');

//     name: DataTypes.STRING,
//     category_id: DataTypes.INTEGER,
//     unit: DataTypes.STRING,
//     weight_based: DataTypes.BOOLEAN,
//     active: DataTypes.BOOLEAN
const rules = [
    body('name').isString().notEmpty().withMessage('Name must be a string'),
    body('category_id').isInt().notEmpty().withMessage('Category ID must be an integer'),
    body('unit').isString().notEmpty().withMessage('Unit must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('active').isBoolean().notEmpty().withMessage('Active must be a boolean'),
    ];

const productValidate = async (req, res, next) => {
    await Promise.all(rules.map((rule) => rule.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(400).json({ errors: errors.array() });
}

module.exports = { productValidate};