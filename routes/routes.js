// the files that contains the routes in the api that will be used by the app
import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import PostsController from '../controllers/PostsController';
import UsersController from '../controllers/UsersController';

// create a router instance
const router = Router();

// routes for authentication endpoints
router.post('/signin', AuthController.signIn);
router.post('/signout', AuthController.signOut);

// routes for the users endpoints
router.get('/users', UsersController.getUsers);
router.get('/user', UsersController.getUser);
router.put('/user', UsersController.editUser);
router.post('/signup', UsersController.addUser);
router.delete('/user', UsersController.deleteUser);

// routes for the posts endpoints
router.get('/posts', PostsController.allPosts);
router.get('/posts/:userId', PostsController.userPosts);
router.put('/post/:postId', PostsController.editPost);
router.put('/like/:postId', PostsController.likePost);
router.put('/dislike/:postId', PostsController.dislikePost);
router.post('/post', PostsController.addPost);
router.put('/comment/:postId', PostsController.addComment);
router.delete('/post/:postId', PostsController.deletePost);

module.exports = router;
