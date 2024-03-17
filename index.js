const express = require('express')
app = express()

const cors = require("cors")

var url = require('url');
const { stringify } = require('querystring');

const port = process.env.PORT || 3000


// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))
app.use(cors({ origin: '*' }))



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
