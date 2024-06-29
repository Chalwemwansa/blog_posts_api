// controller that contains the logic for the users endpoint in the api
import mongoClient from '../utils/mongodb';
import bcrypt from 'bcrypt';
import auth from './AuthController';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';


const UsersController = {
  // get all users from the database
  getUsers: async (req, res) => {
    const token = req.headers['token'];
    const userId = auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const users = await mongoClient.getUsers();
      if (users.status === 'not successful') {
        res.status(500).json(users);
      } else {
        let data = [];
        users.status.forEach( user => {
          let obj = {}
          Object.keys(user).forEach( key => {
            if (key === '_id') {
              obj.id = user._id.toString();
            } else if (key !== 'password') {
              obj[key] = user[key];
            }
          });
          data.push(obj);
        });
        res.status(200).json(data);
      }
    }
  },

  // function for getting a user from the database
  getUser: async (req, res) => {
    const token = req.headers['token'];
    const userId = await auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      let id = req.body.id;
      if (id === undefined) {
        id = userId;
      }
      const user = await mongoClient.getUserById(id);
      if (user === null) {
        res.status(400).json({ error: 'user not found' });
      } else {
        let data = {};
        Object.keys(user).forEach( key => {
          if (key === '_id') {
            data.id = user._id.toString();
          } else if (key !== 'password') {
            data[key] = user[key];
          }
        })
        res.status(200).json(data);
      }
    }
  },

  // the edit user function for editing a user
  editUser: async (req, res) => {
    const body = req.body;
    let data = {};
    const token = req.headers['token'];
    const allowed = ['name', 'email', 'password', 'age', 'gender', 'picture', 'about'];
    // check if the user is authenticated
    const userId = await auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // filter out the values that are not needed
    Object.keys(body).forEach( async (key) => {
      if (allowed.includes(key) && body[key] !== "") {
          data[key] = body[key];
      }
    });
    if (data.password !== undefined) {
      const saltRounds = 11;
      data.password = await bcrypt.hash(data.password, saltRounds);
    }
    const response = await mongoClient.editUser(userId, data);
    if (response.status === 'not successful') {
      res.status(500).json(response);
    } else {
      res.status(204).json({});
    }
  },

  // the addUser function for adding a user to the db if the user does not exists
  addUser: async (req, res) => {
    const body = req.body;
    let data = {};
    const allowed = ['name', 'email', 'password', 'age', 'gender', 'picture', 'about'];
    // filter the content
    Object.keys(body).forEach( async (key) => {
      if (allowed.includes(key) && body[key] !== "") {
        data[key] = body[key];
      }
    });
    const name = body.name || false;
    const email = body.email || false;
    const password = body.password || false;
    if (!(name || email || password)) {
      res.status(400).json({ error: 'name, email and password needed' });
      return;
    }

    const saltRounds = 11;
    data.password = await bcrypt.hash(data.password, saltRounds);

    const response = await mongoClient.addUser(data);
    if (response.status === 'exists') {
      res.status(400).json(response);
    } else if (response.status === 'not successful') {
      res.status(500).json(response);
    } else {
      const token = uuidv4();
      const key = 'auth_' + token;
      await redisClient.set(key, response.status, 86400);
      res.status(201).json({ token, });
    }
  },

  deleteUser: async (req, res) => {
    const token = req.headers['token'];
    // check if the user is authenticated
    const userId = await auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const response = await mongoClient.deleteUser(userId);

    if (response.status === 'not successful') {
      res.status(500).json(response);
    } else {
      res.status(204).json({});
    }
  },
};

module.exports = UsersController;