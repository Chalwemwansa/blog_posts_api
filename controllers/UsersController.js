// controller that contains the logic for the users endpoint in the api
import mongoClient from '../utils/mongodb';
import bcrypt from 'bcrypt';
import auth from './AuthController';

const UsersController = {
  // the edit user function for editing a user
  editUser: async (req, res) => {
    const body = req.body;
    const data = {};
    const userId = req.params.userId;
    const token = req.headers['token'];
    const allowed = ['name', 'email', 'password', 'age', 'gender', 'picture', 'about'];
    // check if the user is authenticated
    if (!auth.isAuthenticated(token, userId)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // filter out the values that are not needed
    Object.keys(body).forEach( async (key) => {
      if (allowed.includes(key) && body[key] !== "") {
        if (key === password) {
          const saltRounds = 11;
          data[key] = await bcrypt.hash(body[key], saltRounds);
        } else {
          data[key] = body[key];
        }
      }
    });
    const response = await mongoClient.editUser(userId, data);
    if (response.status === 'not successful') {
      res.status(500).json(response);
    } else {
      res.status(204);
    }
  },

  // the addUser function for adding a user to the db if the user does not exists
  addUser: async (req, res) => {
    const body = req.body;
    const data = {};
    const allowed = ['name', 'email', 'password', 'age', 'gender', 'picture', 'about'];
    // filter the content
    Object.keys(body).forEach( async (key) => {
      if (allowed.includes(key) && body[key] !== "") {
        if (key === password) {
          const saltRounds = 11;
          data[key] = await bcrypt.hash(body[key], saltRounds);
        } else {
          data[key] = body[key];
        }
      }
    });
    const name = body.name || false;
    const email = body.email || false;
    const password = body.password || false;
    
    if (!(name && email && password)) {
      res.status(400).json({ error: 'name, email and password needed' });
      return;
    }

    if (name === '' || email === '' || password === '') {
      res.status(400).json({ error: 'name, email and password should not be empty' });
      return;
    }

    const response = await mongoClient.addUser(data);
    if (response.status === 'not successful') {
      res.status(500).json(response);
    } else {
      res.status(201).json(response);
    }
  },

  deleteUser: async (req, res) => {
    const userId = req.params.userId;
    const token = req.headers['token'];
    // check if the user is authenticated
    if (!auth.isAuthenticated(token, userId)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const response = await mongoClient.deleteUser(userId);

    if (response.status === 'not successful') {
      res.status(500).json(response);
    } else {
      res.status(204);
    }
  },
};

module.exports = UsersController;