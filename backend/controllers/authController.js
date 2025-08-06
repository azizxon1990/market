const jwt = require('jsonwebtoken');
const env = require('../config/envConfig');
const  { User, Organization } = require('../models/');
const bcrypt = require('bcryptjs');
const { getUserOrganizations } = require('./userController');
const secret = env.jwtSecret;

// run cmd command mkdir user




const login = async (req, res) => {
  
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ 
      where: { 
        username 
      }, 
      include:{
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name']
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Remove password key from user object
    user.password = undefined;
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
    
    res.json({ token, user });
  } catch (error) {    
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  // Invalidate the token (handled on client-side by removing the token)
  res.status(200).json({ message: 'Logged out successfully' });
};


module.exports = {
  login,
  logout
};
