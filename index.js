const express = require('express');
const app = express();
const port = process.env.PORT || 4567;
console.log(port)

/* ===========BODY_PARSER=========== */
const bodyParser = require('body-parser');
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());
// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

/* =============ROUTES============= */
const tweets = require('./controllers/tweets')
const timeline = require('./controllers/timeline')
const router = express.Router();
//
// router.get('/tweet', tweets.getTweet);
// router.post('/tweet', tweets.tweet);
// router.get('/likes', tweets.getLikes);
// router.post('/like', tweets.like);
// router.post('/unlike', tweets.unlike);
// router.get('/retweets', tweets.getRetweets);
// router.post('/retweet', tweets.retweet);
// router.get('/timeline/followees', timeline.getFolloweeTimeline);
// router.get('/timeline/global', timeline.getGlobalTimeline);
// router.get('/timeline/user', timeline.getUserTimeline);
//
// app.use('/', router);
app.get('/',function(req, res, next){
  res.json({"test":"test"})
})
app.listen(port);
