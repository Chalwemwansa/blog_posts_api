// this is the server that runs the application using the express module
import express from 'express';
import routes from './routes/routes';
import path from 'path';

// define the port number
const port = process.env.API_PORT || 5000;

// the api instance
const api = express();
api.use(express.json());

// use the routes from the routes files in routes folder
api.use('/', routes);

// serve static files from the uploads folder
api.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// start the api
api.listen(port, () => {
  console.log(`blog post api running on port ${port}`);
});