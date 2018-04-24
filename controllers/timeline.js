var models  = require('../models');
var sequelize = require('sequelize');
var axios = require('axios')
var client = require('../config/redis')

// Get the tweets from the user, including retweets.
// Example return JSON:
// [
//     {
//         "id": 18,
//         "content": "hi",
//         "createdAt": "2018-04-06T03:10:04.011Z",
//         "user": {
//             "fullName": "yoyo yoyo",
//             "id": 1,
//             "username": "yoyo"
//         }
//     }
// ]
module.exports.getUserTimeline = async (req, res) => {
  try {
      var id = req.body.id;
      var key = 'userTimeline:' + id

      var tweets = await client.lrangeAsync(key, 0, -1)
      if (tweets && tweets.length > 0) {
        tweets = tweets.map(tweet => JSON.parse(tweet))

        return res.json(tweets)
      }

      tweets = await models.Tweet.findAll({
        order: [['createdAt', 'DESC']],
        limit: 50,
        where: { userId: id },
        include: [{
          model: models.User,
          as: 'user',
          attributes: ['id', 'username', 'fname', 'lname']
        }],
        attributes: ['id', 'content', 'createdAt', 'originalId']
      });

      res.json(tweets);

      tweets.forEach(tweet => {
        client.lpush(key, JSON.stringify(tweet))
      })

    } catch (err) {
      console.log(err)
    }
}

// Get the most recent 50 tweets from the people that the user follows.
// Example return JSON:
// [
//     {
//         "content": "",
//         "createdAt": "2018-04-06T03:10:04.011Z",
//         "user": {
//             "fullName": "yoyo yoyo",
//             "id": 1,
//             "username": "yoyo",
//             "fname": "yoyo",
//             "lname": "yoyo"
//         }
//     }
// ]
// TODO: Check Redis for home timeline of the user. If cache miss, use this query.
module.exports.getFolloweeTimeline = async (req, res) => {
  try {
    var id = req.body.id;

    var tweets = await models.Tweet.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'username', 'fname', 'lname'],
        where: {
          id: {
            $in: sequelize.literal(
              `(SELECT  "followeeId" FROM "Relationships" WHERE "followerId"=${id})`)
          }
        }
      }],
      required: true,
      attributes: ['id', 'content', 'createdAt', 'originalId']
    });

    res.json(JSON.parse(JSON.stringify(tweets)));

  } catch (err) {

  }
};

// Get the most recent 50 tweets from all users.
// Example return JSON:
// [
//     {
//         "content": "hello",
//         "createdAt": "2018-04-06T03:10:04.011Z",
//         "user": {
//             "fullName": "yoyo yoyo",
//             "id": 1,
//             "username": "yoyo",
//             "fname": "yoyo",
//             "lname": "yoyo"
//         }
//     }
//   ]
// TODO: Retrieve global timeline from Redis.
module.exports.getGlobalTimeline = async (req, res) => {
  try {
    var key = 'globalTimeline'
    var tweets = await client.lrangeAsync(key, 0, 49)

    if (tweets && tweets.length > 0) {
      tweets = tweets.map(tweet => JSON.parse(tweet))
      return res.json(tweets)
    }

    tweets = await models.Tweet.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'username', 'fname', 'lname']
      }],
      attributes: ['id', 'content', 'createdAt', 'originalId']
    });

    res.json(JSON.parse(JSON.stringify(tweets)));

    tweets.forEach(tweet => client.lpush(key, JSON.stringify(tweet)))

  } catch (err) {
    console.log(err)
  }
};
