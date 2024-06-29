// this is the server that runs the application using the express module
import express from 'express';
import routes from './routes/routes';
import path from 'path';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { stat } from 'fs';

// define the port number
const port = process.env.API_PORT || 5000;

// the api instance
const api = express();
api.use(express.json());

// file handler middleware
api.use(fileUpload());

// enabling cross platform
api.use(cors());

// serve static files from the uploads folder
const staticFilePath = path.join(__dirname, 'uploads');
api.use('/uploads', express.static(staticFilePath));

// use the routes from the routes files in routes folder
api.use('/', routes);

// start the api
api.listen(port, () => {
  console.log(`blog post api running on port ${port}`);
});