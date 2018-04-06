const express = require('express');
const app = express();
const port = process.env.PORT || 4567;

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
const router = express.Router();

router.get('/tweet', tweets.getTweet);
router.post('/tweet', tweets.tweet);
router.get('/likes', tweets.getLikes);
router.post('/like', tweets.like);
router.get('/retweets', tweets.getRetweets);
router.post('/retweet', tweets.retweet);

app.use('/', router);

app.listen(port);
