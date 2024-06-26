// the files that contains the routes in the api that will be used by the app
import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import PostsController from '../controllers/PostsController';
import UsersController from '../controllers/UsersController';

// create a router instance
const router = Router();

// routes for authentication endpoints
router.post('/connect', AuthController.connect);
router.post('/disconnect', AuthController.disconnect);

// routes for the users endpoints
router.put('/:userId', UsersController.editUser);
router.post('/user', UsersController.addUser);
router.delete('/:userId', UsersController.deleteUser);

// routes for the posts endpoints
router.get('/posts', PostsController.allPosts);
router.get('/:userId/posts', PostsController.userPosts);
router.put('/:postId', PostsController.editPost);
router.put('/:postId/like', PostsController.likePost);
router.put('/:postId/dislike', PostsController.dislikePost);
router.post('/post', PostsController.addPost);
router.post('/:postId/comment', PostsController.addComment);
router.delete('/:postId', PostsController.deletePost);

module.exports = router;
