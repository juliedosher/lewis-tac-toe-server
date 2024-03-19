const express = require('express')
app = express()
const cors = require("cors")
const dotenv = require('dotenv');
var url = require('url');
const { stringify } = require('querystring');

const port = process.env.PORT || 8080
dotenv.config()

// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))
app.use(cors({ origin: '*' }))

const { auth } = require('express-openid-connect');


const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: 'http://localhost:8080',
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: 'https://dev-dtw5lccxhfi7uzjg.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));


// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});


app.get('/api/ping', (request, response) => {
	console.log('Calling "/api/ping"')
	response.type('text/plain')
	response.send('ping response')
})


var fs = require('fs');

app.get('/api/GetLewisTacToeLeaders', (request, response) => {
	var leaderboard = JSON.parse(fs.readFileSync('./Leaderboard.json', 'utf8'));
	leaderboard.sort(function(x, y) {
		return parseInt(y['TotalWins']) - parseInt(x['TotalWins'])
	})

	response.json(leaderboard.slice(0, 3))
})



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
