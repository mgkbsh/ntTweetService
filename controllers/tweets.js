var models  = require('../models');
var sequelize = require('sequelize');

// TODO: Parse tweet content in background and insert into Hashtag and Mention.
module.exports.tweet =  async (req, res) => {
  res.status(200).send('success');

  try {
    await models.Tweet.create({
        content: req.query.content,
        userId: req.query.id,
        parentId: req.query.parentId
    });

    await models.User.update(
        { numTweets: sequelize.literal(`"Users"."numTweets" + 1`) },
        { where: { id: req.query.id }
    });

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
  var id = req.query.id

  try {
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
    res.status(404).send(err);
  }
};

module.exports.like = async (req, res) => {
  res.status(200).send('success');

  try {
    await models.Like.create({
      userId: req.query.userId,
      tweetId: req.query.tweetId
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
  var id = req.query.id

  try {
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
    res.status(404).send(err);
  }
};

module.exports.retweet = async (req, res) => {
  res.status(200).send('success');

  try {
    await models.Tweet.create({
        content: "",
        userId: req.query.userId,
        originalId: req.query.tweetId
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
  var id = req.query.id

  try {
    var users = await models.Tweet.findAll({
      where: { originalId: req.query.id },
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['username', 'fname', 'lname']
      }],
      attributes: ['createdAt']
    });

    res.json(JSON.parse(JSON.stringify(users)));

  } catch (err) {
    res.status(404).send(err);
  }
};
