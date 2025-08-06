const bcrypt = require('bcryptjs');
const { User } = require('../models');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ include: 'organization', attributes: ['id', 'full_name', 'username', 'active'] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  const { organization_id, full_name, username, password, active } = req.body;
  try {
    const newUser = await User.create({
      organization_id,
      full_name,
      username,
      password: bcrypt.hashSync(password, 10),
      active
    }, {include: 'organization', attributes: ['id', 'full_name', 'username', 'active']});
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: 'organization' });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {

  const { organization_id, full_name, username, password, active } = req.body;
  const userData = { organization_id, full_name, username, active };
  if (password) {
    userData.password = bcrypt.hashSync(password, 10);
  }

  try {
    const [updated] = await User.update( userData, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedUser = await User.findByPk(req.params.id, { include: 'organization' });
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser
};
