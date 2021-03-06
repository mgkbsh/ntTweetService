var models  = require('../models');
var sequelize = require('sequelize');
var client = require('../config/redis')

// TODO: Parse tweet content in background and insert into Hashtag and Mention.
module.exports.tweet =  async (req, res) => {
  try {
    res.status(200).send('success');

    var user = req.body.user;

    var tweet = await models.Tweet.create({
       content: req.body.content,
       userId: user.id,
       parentId: req.body.parentId
   });

   models.User.update(
       { numTweets: sequelize.literal(`"Users"."numTweets" + 1`) },
       { where: { id: user.id }
   });

    // client.lpushAsync('writer', JSON.stringify(tweet))
    tweet.user = user
    var string = JSON.stringify(tweet)
    client.rpush('writer', string)
    await client.lpushAsync('userTimeline:' + user.id, string)
    await client.lpushAsync('globalTimeline', string)
    client.ltrim('userTimeline:' + user.id, 0, 49)
    client.ltrim('globalTimeline', 0, 49)

  } catch (err) {

  }
};

// Example return JSON:
// {
//     "content": "hey",
//     "createdAt": "2018-04-04T22:38:40.178Z",
//     "user": {
//         "fullName": "yoyo yoyo",
//         "username": "yoyo"
//     }
// }
module.exports.getTweet =  async (req, res) => {
  try {
    var id = req.body.id;

    var tweet = await models.Tweet.findOne({
      where: { id: id },
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['username', 'fname', 'lname']
      }],
      attributes: ['content', 'createdAt']
    });

    res.json(tweet);

  } catch (err) {
  }
};

module.exports.like = async (req, res) => {
  try {
    res.status(200).send('success');

    console.log("liking")

    await models.Like.create({
      userId: req.body.userId,
      tweetId: req.body.tweetId
    })

  } catch (err) {

  }
};

module.exports.unlike = async (req, res) => {
  try {
    res.status(200).send('success');

    await models.Like.destroy({
      userId: req.body.userId,
      tweetId: req.body.tweetId
    })
  } catch (err) {

  }
};


// Example return JSON:
// [
//     {
//         "createdAt": "2018-04-06T03:10:04.011Z",
//         "user": {
//             "fullName": "yoyo yoyo",
//             "username": "yoyo"
//         }
//     }
// ]
module.exports.getLikes = async (req, res) => {
  try {
    var id = req.body.id;

    var users = await models.Like.findAll({
      where: { tweetId: id },
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['username']
      }],
      attributes: ['createdAt']
    });

    res.json(JSON.parse(JSON.stringify(users)));

  } catch (err) {

  }
};

module.exports.retweet = async (req, res) => {
  try {
    res.status(200).send('success');

    await models.Tweet.create({
        content: "",
        userId: req.body.userId,
        originalId: req.body.tweetId
    })

  } catch (err) {

  }
};

// Example return JSON:
// [
//     {
//         "createdAt": "2018-04-06T03:10:04.011Z",
//         "user": {
//             "fullName": "yoyo yoyo",
//             "username": "yoyo"
//         }
//     }
// ]
module.exports.getRetweets = async (req, res) => {
  try {
    var id = req.body.id;

    var users = await models.Tweet.findAll({
      where: { originalId: id},
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['username', 'fname', 'lname']
      }],
      attributes: ['createdAt']
    });

    res.json(JSON.parse(JSON.stringify(users)));

  } catch (err) {
  }
};
