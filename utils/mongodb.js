// this module connects the api to the Mongoclient on the server
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { response } from 'express';

const host = process.env.BLOG_HOST || '127.0.0.1';
const port = process.env.BLOG_PORT ||  27017;
const database = process.env.BLOG_DB || 'blogs_db';
const url = `mongodb://${host}:${port}`;

class Mongo {
  constructor() {
    this.client = MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    (async () => {
      await this.client.connect();
      this.session = this.client.db(database);
    })();
  }

  // deletes all pictures in the the file system that are related to a post
  async deletePictures(pictures) {
    const root = path.join(__dirname, '..', 'uploads');
    pictures.forEach( async (picture) => {
      const filePath = path.join(root, picture);
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.log(`error: ${err}`);
      }
    });
  }

  // method usd to upload multiple images to the file system
  async uploadPictures(pictures) {
    let pics = [];
    let filename;
    let name;
    let filePath;
    if (Array.isArray(pictures)) {
      for (const picture of pictures) {
        name = picture.name;
        if (picture.name.split('.')[1] === 'jfif') {
          name = `${picture.name.split('.')[0]}.jpeg`
        }
        filename = `${Date.now()}-${name}`;
        filePath = path.join('uploads', filename);
        await picture.mv(filePath);
        pics.push(filename);
      };
    } else {
      name = pictures.name
      if (pictures.name.split('.')[1] === 'jfif') {
        name = `${pictures.name.split('.')[0]}.jpeg`
      }
      filename = `${Date.now()}_${name}`;
      filePath = path.join('uploads', filename);
      await pictures.mv(filePath);
      pics.push(filename);
    }
    return pics;
  }

  // method that is an helper deletes all the posts related to a user
  async deletePostsPictures(postsArray) {
    // get an array of pics to delete from the file system
    let pictures = [];
    postsArray.forEach( post => {
      const pics = post.pictures;
      pictures.push(...pics);
    });
    await this.deletePictures(pictures);
  }

  // checks if a password matches with the one in the database that is hashed
  async checkPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // get a user based on the id of the user in the db
  async getUserById(id) {
    const query = {
      _id: new ObjectId(id),
    };
    return await this.session.collection('users').findOne(query) || null;
  }

  // get a user based on the email of the user
  async getUserByEmail(email) {
    return await this.session.collection('users').findOne({ email: email }) || null;
  }

  // method that gets  apost from the db using the id of the post
  async getPost(id) {
    const query = {
      _id: new ObjectId(id),
    };
    return await this.session.collection('posts').findOne(query) || null;
  }

  // method that adds a user to the mongodb database only if the user does not exist
  async addUser(data) {
    if (await this.getUserByEmail(data.email) !== null) {
      return { status: 'exists' };
    }
    const user = await this.session.collection('users').insertOne(data) || null;
    if (user.insertedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: user.insertedId.toString() };
  }

  // method that adds a post to the database and links the post to a given user
  async addPost(data) {
    data.comments = [];
    data.likes = [];
    data.dislikes = [];
    if (data.pictures === undefined) {
      data.pictures = [];
    }
    data.createdAt = Date.now();

    const post = await this.session.collection('posts').insertOne(data);
    if (post.insertedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: post.insertedId.toString() };
  }

  // method that edits a post that has been made in the database
  async editPost(id, data) {
    const query = { _id: new ObjectId(id) };
    const pictures = data.pictures;
    delete data.pictures;
    let update = { $set: data };
    const updatedPost = await this.session.collection('posts').updateOne(query, update);
    if (pictures !== undefined) {
      update = {
        $push: {
          pictures: {
            $each: pictures,
          }
        }
      };
      await this.session.collection('posts').updateOne(query, update);
    }
    if (updatedPost.matchedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that edits a give user using the email for searching
  async editUser(id, data) {
    let query = {
      'owner.id': id,
    };
    let newdata = {}
    let flag = false;
    if (data.name !== undefined) {
      newdata['owner.name'] = data.name;
      flag = true;
    }
    if (data.picture !== undefined) {
      newdata['owner.picture'] = data.picture;
      flag = true;
    }

    let update = {
      $set: newdata
    }
    await this.session.collection('posts').updateMany(query, update);
    query = { _id: new ObjectId(id) };
    update = { $set: data };
    const updatedUser = await this.session.collection('users').updateOne(query, update);
    if (updatedUser.matchedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that deletes a post from the db using the post id
  async deletePost(id) {
    const query = { _id: new ObjectId(id) };
    const post = await this.getPost(id);
    const posts = [post];
    await this.deletePostsPictures(posts);
    const status = await this.session.collection('posts').deleteOne(query);
    if (status.deletedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that is used to delete a user based on the id of the user
  async deleteUser(id) {
    // remove all comments made by user on any post
    let update = {
      $pull: { comments: { id, } },
    };
    let query = {
      comments: { $elemMatch: { id, } },
    }
    await this.session.collection('posts').updateMany(query, update);
    // remove all likes made by user on any post
    update = {
      $pull: { likes: { id, } },
    };
    query = {
      likes: { $elemMatch: { id, } },
    }
    await this.session.collection('posts').updateMany(query, update);
    // remove all dislikes made by user on any post
    update = {
      $pull: { dislikes: { id, } },
    };
    query = {
      dislikes: { $elemMatch: { id, } },
    }
    await this.session.collection('posts').updateMany(query, update);
    // delete all posts made by the user and their pictures
    query = {
      'owner.id': id,
    };
    const posts = await this.getUserPosts(id) || null;
    if (!(posts === null)) {
      await this.deletePostsPictures(posts.status);
    }
    await this.session.collection('posts').deleteMany(query);
    const user = await this.getUserById(id);
    await this.deletePictures([user.picture]);
    query = { _id: new ObjectId(id) };
    const status = await this.session.collection('users').deleteOne(query);
    if (status.deletedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that likes  a post in the db
  async likePost(id, data) {
    let query = { 
      _id: new ObjectId(id),
      likes: { $elemMatch: { id: data.id } },
    };
    // check if post contains any like by the user
    let exists = await this.session.collection('posts').findOne(query) || null;
    let update;
    // if the like exists, then unlike the post
    if (exists === null) {
      // if no likes are found by the given user, check if there are any dislikes by the user
      query = { 
        _id: new ObjectId(id),
        dislikes: { $elemMatch: { id: data.id } },
      };
      exists = await this.session.collection('posts').findOne(query) || null;
      // if there is a dislike then remove the dislike and add a like
      if (exists === null) {
        update = {
          $push: {
            likes: data
          }
        };
      } else {
        // first remove the dislike then add the like to the likes array
        update = {
          $pull: { 
            dislikes: { id: data.id }
          },
        }
        await this.session.collection('posts').updateOne(query, update);
        update = {
          $push: {
            likes: data
          },
        };
      }
    } else {
      update = {
        $pull: { likes: { id: data.id } },
      };
    }
    query = { _id: new ObjectId(id) };
    const status = await this.session.collection('posts').updateOne(query, update);
    if (status.matchedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that dislikes  a post in the db
  async dislikePost(id, data) {
    // check if the user already disliked the post
    let query = { 
      _id: new ObjectId(id),
      dislikes: { $elemMatch: { id: data.id } },
    };
    let exists = await this.session.collection('posts').findOne(query) || null;
    let update;
    // if user disliked it then remove the dislike
    if (exists === null) {
      // else check if the user liked the post
      query = { 
        _id: new ObjectId(id),
        likes: { $elemMatch: { id: data.id } },
      };
      exists = await this.session.collection('posts').findOne(query);
      // if user liked the post then remove the like and add a dislike
      if (exists === null) {
        update = {
          $push: {
            dislikes: data
          }
        };
      } else {
        // remove the like first and then add the dislike
        update = {
          $pull: { likes: { id: data.id } },
        }
        await this.session.collection('posts').updateOne(query, update);
        update = {
          $push: {
            dislikes: data
          }
        };
      }
    } else {
      update = {
        $pull: { dislikes: { id: data.id } },
      }
    }
    query = { _id: new ObjectId(id) };
    const status = await this.session.collection('posts').updateOne(query, update);
    if (status.matchedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that adds a comment to the comments list in the posts
  async addComment(id, data) {
    const query = { _id: ObjectId(id) };
    const update = {
      $push: {
        comments: data,
      },
    }
    const status = await this.session.collection('posts').updateOne(query, update);
    if (status.matchedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that gets all users from the database
  async getUsers() {
    const users = await this.session.collection('users').find().toArray();
    if (users === null) {
      return { status: 'not successful' };
    }
    return { status: users };
  }

  // get all the posts in the db
  async getPosts() {
    // get the newest posts first
    const sortBy = {
      createdAt: -1
    };
    const posts = await this.session.collection('posts').find().sort(sortBy).toArray() || null;
    if (posts === null) {
      return { status: 'not successful' };
    }
    return { status: posts };
  }

  // get posts by a specific user in the database
  async getUserPosts(id) {
    const query = {
      'owner.id': id,
    };
    const sortBy = {
      createdAt: -1
    };
    const posts = await this.session.collection('posts').find(query).sort(sortBy).toArray() || null;
    if (posts === null) {
      return { status: 'not successful' };
    }
    return { status: posts };
  }

  // delete an image in a post
  async deleteImage(postId, image) {
    const query = {
      _id: ObjectId(postId),
    };
    const update = {
      $pull: { pictures: image },
    }
    await this.deletePictures([image]);
    await this.session.collection('posts').updateOne(query, update);
    if (response.matchedCount === 0) {
      return ({ error: 'deleted 0' })
    }
    return ({ status: true });
  }

  // delete the image of a user
  async deleteUserPic(userId) {
    let query = {
      'owner.id': userId,
    };
    let update = {
      $unset: {
        'owner.picture' : 1,
      }
    }
    await this.session.collection('posts').updateMany(query, update);
    query = {
      _id: new ObjectId(userId),
    };
    update = {
      $unset: {
        picture: 1,
      }
    }
    const user = await this.getUserById(userId);
    await this.deletePictures([user.picture]);
    await this.session.collection('users').updateOne(query, update);
    if (response.matchedCount === 0) {
      return ({ error: 'deleted 0' });
    }
    return ({ status: true });
  }
}

const mongo = new Mongo();
module.exports = mongo;