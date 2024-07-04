// the files that contains the routes in the api that will be used by the app
import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import PostsController from '../controllers/PostsController';
import UsersController from '../controllers/UsersController';

// create a router instance
const router = Router();

// routes for authentication endpoints
router.post('/signin', AuthController.signIn);  // done
router.post('/signout', AuthController.signOut); //almost

// routes for the users endpoints
router.get('/users', UsersController.getUsers); // done
router.get('/user/:id', UsersController.getUser); // done
router.put('/user', UsersController.editUser); // done
router.post('/signup', UsersController.addUser);  // done
router.delete('/user', UsersController.deleteUser);
router.delete('/user/picture', UsersController.deleteUserPic) // done

// routes for the posts endpoints
router.get('/post/:postId', PostsController.getPost);  // done
router.get('/posts', PostsController.allPosts); // done
router.get('/posts/:userId', PostsController.userPosts); // done
router.put('/post/:postId', PostsController.editPost); // done
router.put('/like/:postId', PostsController.likePost);  // done
router.put('/dislike/:postId', PostsController.dislikePost);  // none
router.post('/post', PostsController.addPost); // done
router.put('/comment/:postId', PostsController.addComment); // done
router.delete('/post/:postId', PostsController.deletePost); // done
router.delete('/post/:postId/:imageUrl', PostsController.deleteImage); // done

module.exports = router;
