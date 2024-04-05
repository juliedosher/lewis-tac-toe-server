const express = require('express')
app = express()
const cors = require("cors")
const dotenv = require('dotenv')
dotenv.config()
var url = require('url')

const { auth } = require('express-openid-connect')
const { requiresAuth } = require('express-openid-connect')
var fs = require('fs')

const mongoose = require("mongoose")
const MongoClient = require('mongodb').MongoClient
const mongoUri = process.env.MONGO_URI;
const Schema = mongoose.Schema

const port = process.env.PORT || 8080


// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))
app.use(cors({ origin: '*' }))


// Auth0 config
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: 'https://dev-dtw5lccxhfi7uzjg.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));


// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/login', (req, res) =>
  res.oidc.login({
    authorizationParams: {
      redirect_uri: 'http://localhost:3000/callback',
    },
  })
);

app.get('/api/ping', (request, response) => {
	console.log('Calling "/api/ping"')
	response.type('text/plain')
	response.send('ping response')
})

const mongoClient = new MongoClient(mongoUri).db("TicTacToe")
const leaderboardSchema = new Schema({
  UserName: String,
  TotalWins: Number
})
const Leader = mongoose.model('Leader', leaderboardSchema)
const leaderColl = mongoClient.collection("Leaderboard");
async function connectDB() {
  try {
    await mongoose.connect(mongoUri)
  } catch (err) {
    console.log(err)
  }
}
connectDB()

app.get('/api/GetLewisTacToeLeaders', async (req, res) => {
  var leaders = []
  const pipeline = [
    { $sort: {TotalWins: -1} },
    { $limit: 3 } 
  ];
  // Execute the aggregation
  const aggCursor = leaderColl.aggregate(pipeline);
  // Print the aggregated results
  for await (const doc of aggCursor) {
      leaders.push(doc)
  }
  res.type('application/json');
  res.send(JSON.stringify(leaders))
})



app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});



// Custom 404 page.
app.use((request, response) => {
  response.type('text/plain')
  response.status(404)
  response.send('404 - Not Found')
})

// Custom 500 page.
app.use((err, request, response, next) => {
  console.error(err.message)
  response.type('text/plain')
  response.status(500)
  response.send('500 - Server Error')
})

app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`)
)
