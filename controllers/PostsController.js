// the posts controller that is responsible for handling requests to the posts
// endpoint
import mongoClient from '../utils/mongodb';
import auth from './AuthController';

const PostsController = {
  allPosts: async (req, res) => {
    const token = req.headers['token'] || null;
    const userId = await auth.getUserId(token);
    if (userId === null) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const response = await mongoClient.getPosts();
    if (response.status === 'not successful') {
      return res.status(500).json(response);
    } else {
      return res.status(200).json(response);
    }
  },

  userPosts: async (req, res) => {
    const token = req.headers['token'];
    let userId = await auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      userId = req.body.userId;
      if (userId === undefined) {
        res.status(400).json({ error: 'user id not provided' });
        return;
      }
      const user = await mongoClient.getUserById(userId);
      if ( user === null) {
        res.status(400).json({ error: 'user not found' });
        return;
      }
      const posts = await mongoClient.getUserPosts(userId);
      if (posts.status === 'not successful') {
        res.status(500).json({ error: 'Failed to get user posts' });
      } else {
        res.status(200).json(posts);
      }
    }
  },

  editPost: async (req, res) => {
    const postId = req.params.postId;
    const token = req.headers['token'];
    const userId = await auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const post = mongoClient.getPost(postId);
      if (post.owner.id !== userId) {
        res.status(401).json({ error: 'Permission denied' });
      } else {
        const permitted = ['name', 'type', 'content', 'pictures'];
        const body = req.body;
        let data = {};
        Object.keys(body).forEach( (key) => {
          if (permitted.includes(key)) {
            data[key] = body[key];
          }
        });
        const response = await mongoClient.editPost(postId, data);
        if (response.status === 'not successful') {
          res.status(500).json(response);
        } else {
          res.status(204);
        }
      }
    }
  },

  likePost: async (req, res) => {
    const token = req.headers['token'];
    const userId = await auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const postId = req.params.postId;
      const user = await mongoClient.getUserById(userId);
      if (user === null) {
        res.status(400).json({ error: 'user not found' });
        return;
      }
      const data = {
        id: userId,
        name: user.name,
      };
      const response = await mongoClient.likePost(postId, data);
      if (response.status === 'not successful') {
        res.status(500).json(response);
      } else {
        res.status(204);
      }
    }
  },

  dislikePost: async (req, res) => {
    const token = req.headers['token'];
    const postId = req.params.postId;
    const userId = await auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const user = await mongoClient.getUserById(userId);
      if (user === null) {
        res.status(400).json({ error: 'user not found' });
        return;
      }
      const data = {
        id: userId,
        name: user.name,
      };
      const response = await mongoClient.dislikePost(postId, data);
      if (response.status === 'not successful') {
        res.status(500).json(response);
      } else {
        res.json(204);
      }
    }
  },

  addPost: async (req, res) => {
    const token = req.headers['token'];
    const userId = await auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const body = req.body;
      let data = {};
      const permitted = ['name', 'type', 'content', 'pictures'];
      Object.keys(body).forEach( key => {
        if (permitted.includes(key)) {
          data[key] = body[key];
        }
      });
      const user = await mongoClient.getUserById(userId);
      if (user === null) {
        res.status(400).json({ error: 'user not found' });
        return;
      }
      data.owner = {
        id: userId,
        name: user.name,
      };
      const response = await mongoClient.addPost(data);
      if (response.status === 'not successful') {
        res.status(500).json(response);
      } else {
        res.status(201).json(response);
      }
    }
  },

  addComment: async (req, res) => {
    const token = req.headers['token'];
    const userId = await auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const user = await mongoClient.getUserById(userId);
      if (user === null) {
        res.status(400).json({ error: 'user not found in the db' });
      } else {
        const comment = req.body.comment;
        if (comment === undefined) {
          res.status(400).json({ error: 'comment missing' });
        } else {
          const postId = req.params.postId;
          const data = {
            id: userId,
            name: user.name,
            comment,
          };
          const response = await mongoClient.addComment(postId, data);
          if (response.status === 'not successful') {
            res.status(500).json(response);
          } else {
            res.status(201);
          }
        }
      }
    }
  },

  deletePost: async (req, res) => {
    const token = req.headers['token'];
    const userId = await auth.getUserId(token);
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const postId = req.params.postId;
      const post = await mongoClient.getPost(postId);
      if (post === null) {
        res.status(400).json({ error: 'post not found' });
      } else {
        if (post.owner.id !== userId) {
          res.status(401).json({ error: 'Unauthorized' });
        } else {
          const response = await mongoClient.deletePost(postId);
          if (response.status === 'not successful') {
            res.status(500).json(response);
          } else {
            res.status(204);
          }
        }
      }
    }
  },
};

module.exports = PostsController;