require('newrelic')

const express = require('express');
const app = express();
const port = process.env.PORT || 4567;
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {
  // Create a worker for each WORKERS
  for (var i = 0; i < WORKERS; i += 1) {
    console.log("Spawning workers")
    cluster.fork();
  }
  // Code to run if we're in a worker process
} else {

  const async = require('async');

  var https = require('https');
  https.globalAgent.maxSockets = Infinity;
  app.https=https

  var http = require('http');
  http.globalAgent.maxSockets = Infinity;
  app.http=http

  /* ===========BODY_PARSER=========== */
  const bodyParser = require('body-parser');

  function parallel(middlewares) {
    return function (req, res, next) {
      async.each(middlewares, function (mw, cb) {
        mw(req, res, cb);
      }, next);
    };
  }

  app.use(parallel([
    // Parse application/x-www-form-urlencoded
    bodyParser.urlencoded({ extended: false }),
    // Parse application/json
    bodyParser.json(),
    // Parse application/vnd.api+json as json
    bodyParser.json({ type: 'application/vnd.api+json' })

  ]));

  /* =============ROUTES============= */
  const tweets = require('./controllers/tweets')
  const timeline = require('./controllers/timeline')
  const router = express.Router();

  router.get('/tweet', tweets.getTweet);
  router.post('/tweet', tweets.tweet);
  router.get('/likes', tweets.getLikes);
  router.post('/like', tweets.like);
  router.post('/unlike', tweets.unlike);
  router.get('/retweets', tweets.getRetweets);
  router.post('/retweet', tweets.retweet);
  router.get('/timeline/followees', timeline.getFolloweeTimeline);
  router.get('/timeline/global', timeline.getGlobalTimeline);
  router.get('/timeline/user', timeline.getUserTimeline);
  router.get('/test',function(req, res, next){
    res.json({"test":"test"})
  })
  app.use('/', router);

  app.listen(port);
}
