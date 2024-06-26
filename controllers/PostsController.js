// the posts controller that is responsible for handling requests to the posts
// endpoint
import mongoClient from '../utils/mongodb';
import auth from './AuthController';

const PostsController = {
  allPosts: async (req, res) => {
    const token = req.headers['token'];
    const userId = req.body.userId;
    if (!auth.isAuthenticated(token, userId)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const response = await mongoClient.getPosts();
    if (response.posts === undefined) {
      res.status(400).json(response);
    } else {
      res.json(200).json(response);
    }
  },
  userPosts: async (req, res) => {},
  editPost: async (req, res) => {},
  likePost: async (req, res) => {},
  dislikePost: async (req, res) => {},
  addPost: async (req, res) => {},
  addComment: async (req, res) => {},
  deletePost: async (req, res) => {},
};

module.exports = PostsController;