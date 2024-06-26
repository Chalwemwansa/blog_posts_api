// this module contains an object that has functions for authentication and adding
// a token to the redis api
import mongoClient from '../utils/mongodb';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';

const Auth = {
  signIn: async (req, res) => {
    const [ email, password ] = req.body;
    const requiredFields = ['email', 'password'];
    const verify = Object.keys(data).each(key => requiredFields.includes(key));
    if (!verify) {
      res.status(400).json({ error: 'email and password required' });
    } else {
      const user = await mongoClient.getUser(email);
      if (user === null) {
        res.status(404).json({ error: 'User Not Found' })
      } else {
        if (await mongoClient.checkPassword(password, user.password)) {
          const token = uuidv4();
          const key = 'auth_' + token;
          await redisClient.set(key, user._id.toString(), 86400);
          res.status(200).json({ token, });
        } else {
          res.status(401).json({ error: 'Unauthorized' });
        }
      }
    }
  },

  signOut: async (req, res) => {
    const token = req.headers['token'] || null;
    if (token === null) {
      res.status(400).json({ error: 'token header missing' });
    } else {
      const key = 'auth_' + token;
      const result = await redisClient.del(key) || null;
      if (result === null) {
        res.status(401).json({ error: 'Unauthorized' });
      } else {
        res.status(204);
      }
    }
  },

  // checks if the user is authenticated
  getUserId: async (token) => {
    const key = 'auth_' + token;
    const userId = await redisClient.get(key) || null;
    return userId;
  }
};

module.exports = Auth;