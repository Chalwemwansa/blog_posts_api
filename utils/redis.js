// module contains code for storing data to a redis server for a specific period of time
// and the delete method for deleting the key when it expires
import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient()
      .on('error', (err) => {
        console.log(err);
      });
  }

  // the asynchronous get method that returns a value for a key
  // passed as an argument
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  // method that sets a value for a key for a specified period of time
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        return resolve(result);
      });
    });
  }
}

// create an instance of redis client and export it
const redisClient = new RedisClient();
module.exports = redisClient;