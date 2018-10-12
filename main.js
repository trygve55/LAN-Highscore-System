var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
    config = require('./config'),
    dbc = require('./databaseController'),
    jwt    = require('jsonwebtoken');

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

app.start = app.listen = function(){
  return server.listen.apply(server, arguments)
};

app.start(config.port);

app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

console.log("Server started on port " + config.port + ".");

app.get('/', function (req, res) {
    dbc.getGames(function (err, games) {
       if (err)
           return res.status(500).send();

       res.render('index', {'games' : games, 'title' : 'LAN Highscores'});
    });
});

app.get('/game/:gameId', function (req, res) {
    dbc.getGame(req.params.gameId, function (err, game) {
        if (err)
            return res.status(500).send();

        if (game === undefined)
            return res.status(404).send();

        res.render('game', {'game' : game});
    });
});

//Get all games
app.get('/api/games', function (req, res) {
    dbc.getGames(function (err, games) {

        if (err)
            return res.status(500).send();

        return res.json(games);
    });
});

//Get game
app.get('/api/games/:gameId', function (req, res) {
    dbc.getGame(req.params.gameId, function (err, game) {
        if (err)
            return res.status(500).send();

        if (game === undefined)
            return res.status(404).send();

        return res.json(game);
    })
});

//Login send token to client
app.post('/api/login', function (req, res) {
    if (req.body.username === "test" && req.body.password === "test") {
        var userId = 0;

        var newToken = jwt.sign({'userId': userId, 'role': 0}, config.secret, {
            expiresIn: "1 days"
        });
        return res.json({'token' : newToken});
    } else {
        return res.status(403).send();
    }
});

//Validate token
app.use('/api/games(/*)?', function (req, res, next) {
    if (req.query.token) {
        jwt.verify(req.query.token, config.secret, function(err, decoded) {
            if (err)
                res.status(500).send();
            else {
                req.decoded = decoded;

                next();
            }
        });
    } else
        res.status(403).send();
});

//Add game
app.post('/api/games', function (req, res) {
    dbc.addGame(req.body.game_name, function (err, changes) {
        if (err)
            return res.status(500).send();

        if (changes === 0)
            return res.status(404).send();

        io.emit('update', req.params.gameId);
        return res.send();
    });
});

//edit game
app.put('/api/games/:gameId', function (req, res) {
    dbc.updateGame(req.body.game_name, function (err, changes) {
        if (err)
            return res.status(500).send();

        if (changes === 0)
            return res.status(404).send();

        io.emit('update', req.params.gameId);
        return res.send();
    });
});

//remove game
app.delete('/api/games/:gameId', function (req, res) {
    dbc.removeGame(req.params.gameId, function (err, changes) {
        if (err)
            return res.status(500).send();

        if (changes === 0)
            return res.status(404).send();

        io.emit('update', req.params.gameId);
        return res.send();
    });
});

//Removes all games
app.delete('/api/games', function (req, res) {
    dbc.removeAllGames(function (err) {
        if (err)
            return res.status(500).send();

        io.emit('update', req.params.gameId);
        return res.send();
    })
});

//Add highscore to game
app.post('/api/games/:gameId', function (req, res) {
    if (req.body.playerName.length < config.minPlayerNameLength)
        return res.status(400).send();

    dbc.addHighscore(req.params.gameId, req.body.score, req.body.playerName, function (err, changes) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }

        if (changes === 0)
            return res.status(404).send();

        io.emit('update', req.params.gameId);
        return res.send();
    });
});

//Resets all highscores for a game
app.delete('/api/games/:gameId/reset', function (req, res) {
    dbc.resetGameHighscore(req.params.gameId, function (err) {
        if (err)
            return res.status(500).send();

        io.emit('update', req.params.gameId);
        return res.send();
    });
});

//Remove highscore from a game
app.delete('/api/games/:gameId/:highscoreId', function (req, res) {
    dbc.removeHighscore(req.params.highscoreId, function (err, changes) {
        if (err)
            return res.status(500).send();

        if (changes === 0)
            return res.status(404).send();

        io.emit('update', req.params.gameId);
        return res.send();
    });
});