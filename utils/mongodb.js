// this module connects the api to the Mongoclient on the server
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

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

  // checks if a password matches with the one in the database that is hashed
  async checkPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async getUser(email) {
    return await this.session.collection('users').findOne({email,}) || null;
  }

  // method that adds a user to the mongodb database only if the user does not exist
  async addUser(data) {
    if (await this.getUser(data.email) !== null) {
      return { status: 'exists' };
    }
    const user = await this.session.collection('users').insertOne(data);
    if (!user.acknowledged) {
      return { status: 'not successful' };
    }
    return { status: user.insertedId.toString() };
  }

  // method that adds a post to the database and links the post to a given user
  async addPost(data) {
    data.comments = [];
    data.likes = 0;
    data.dislikes = 0;

    const post = await this.session.collection('posts').insertOne(data);
    if (!user.acknowledged) {
      return { status: 'not successful' };
    }
    return { status: post.insertedId.toString() };
  }

  // method that edits a post that has been made in the database
  async editPost(id, data) {
    const query = { _id: new ObjectId(id) };
    const updatedPost = await this.session.collection('posts').updateOne(query, data);
    if (updatedPost.matchedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that edits a give user using the email for searching
  async editUser(id, data) {
    const query = { _id: new ObjectId(id) };
    const updatedUser = await this.session.collection('users').updateOne(query, data);
    if (updatedUser.matchedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that deletes a post from the db using the post id
  async deletePost(id) {
    const query = { _id: new ObjectId(id) };
    const status = await this.session.collection('posts').deleteOne(query);
    if (status.deletedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that is used to delete a user based on the id of the user
  async deleteUser(id) {
    let query = {
      'owner.id': id
    };
    const posts = await this.session.collection('posts').deleteMany(query);
    if (posts.deletedCount === 0) {
      return { status: 'not successful' };
    }
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
    const exists = await this.session.collection('posts').findOne(query) || null;
    query = { _id: new ObjectId(id) };
    let update;
    if (exists === null) {
      update = {
        $push: {
          likes: data
        }
      };
    } else {
      update = {
        $pull: { likes: { id: data.id } },
      };
    }
    const status = await this.session.collection('posts').updateOne(query, update);
    if (status.matchedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // method that dislikes  a post in the db
  async dislikePost(id, data) {
    let query = { 
      _id: new ObjectId(id),
      dislikes: { $elemMatch: { id: data.id } },
    };
    const exists = await this.session.collection('posts').findOne(query) || null;
    query = { _id: new ObjectId(id) };
    let update;
    if (exists === null) {
      update = {
        $push: {
          dislikes: data
        }
      };
    } else {
      update = {
        $pull: { dislikes: { id: data.id } },
      }
    }
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
    const status = await this.collection('posts').updateOne(query, update);
    if (status.matchedCount === 0) {
      return { status: 'not successful' };
    }
    return { status: 'successful' };
  }

  // get all the posts in the db
  async getPosts() {
    // get the newest posts first
    const sortBy = {
      createdAt: -1
    };
    const posts = await this.session.collection('posts').find({}).sort(sortBy).toArray() || null;
    if (posts === null) {
      return { status: 'not successful' };
    }
    return {posts: posts};
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
    return {posts: posts};
  }
}

const mongo = new Mongo();
module.exports.default = mongo;