var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('database.db');

module.exports = {
    getGames : function(next) {
        db.all("SELECT Games.game_id, game_name, game_logo_url, game_background_url, score, player_name FROM Games LEFT JOIN (SELECT Scores.game_id, Scores.score_id, Scores.score, Scores.player_name FROM Scores INNER JOIN (SELECT game_id, MAX(score) AS Maxscore FROM Scores GROUP BY game_id) topscore ON Scores.game_id = topscore.game_id AND Scores.score = topscore.maxscore) test ON Games.game_id = test.game_id",[],(err, games ) => {
            if (next)
                next(err, games);
        });
    },
    getGame : function(gameId, next) {
        db.get("SELECT * FROM Games WHERE game_id = ?",[gameId],(err, game) => {

            if (err || game === undefined)
                return next(err, game);

            db.all("SELECT score_id, score, player_name FROM Scores WHERE game_id = ? ORDER BY score DESC",[gameId] , function (err, scores) {
                game['scores'] = (scores === undefined) ? [] : scores;
                next(err, game);
            });
        });
    },
    addGame : function(game_name, next) {
        db.run("INSERT INTO Games (game_name) VALUES (?)", [game_name], function (err) {
            next(err, this.changes);
        });
    },
    updateGame : function(gameId, gameName, next) {
        db.run("UPDATE Games SET game_name = ? WHERE game_id = ?", [gameName, gameId], function (err) {
            next(err, this.changes);
        });
    },
    removeGame : function(gameId, next) {
        db.run("DELETE FROM Games WHERE game_id = ?", [gameId], function (err) {
            next(err, this.changes);
        });
    },
    removeAllGames : function(next) {
        db.run("DELETE FROM Games", [], function (err) {
            next(err);
        });
    },
    resetGameHighscore : function(gameId, next) {
        db.run("DELETE FROM Scores WHERE game_id = ?", [gameId], function (err) {
            next(err);
        });
    },
    addHighscore : function(gameId, score, playerName, next) {
        if (playerName.length == 0)
            return next(-1);

        db.run("INSERT INTO Scores (game_id, score, player_name) VALUES (?, ?, ?)", [gameId, score, playerName], function (err) {
            next(err, this.changes);
        });
    },
    removeHighscore : function(highscoreId, next) {
        db.run("DELETE FROM Scores WHERE score_id = ?", [highscoreId], function (err) {
            next(err, this.changes);
        });
    }
};

db.serialize(function () {
    db.run("DROP TABLE IF EXISTS Settings");
    db.run("DROP TABLE IF EXISTS Users");
    db.run("DROP TABLE IF EXISTS Games");
    db.run("DROP TABLE IF EXISTS Scores");
    db.run("CREATE TABLE Games (game_id INTEGER PRIMARY KEY AUTOINCREMENT, game_name text NOT NULL, game_logo_url text, game_background_url)");
    db.run("CREATE TABLE Scores (score_id INTEGER PRIMARY KEY AUTOINCREMENT, game_id INTEGER NOT NULL, score INTEGER NOT NULL, player_name text NOT NULL, FOREIGN KEY(game_id) REFERENCES Games(game_id))");
    db.run("CREATE TABLE Users (user_id INTEGER PRIMARY KEY AUTOINCREMENT, role INTEGER NOT NULL, username text NOT NULL, salt text NOT NULL, hash text NOT NULL)");
    db.run("CREATE TABLE Settings (setting text PRIMARY KEY, value text NOT NULL)");
    db.run("INSERT INTO Settings (setting, value) VALUES (?, ?)", ['main_banner_url', 'https://tihlde.org/assets/2017/03/nyeste-banner-liten-3.png']);
    db.run("INSERT INTO Settings (setting, value) VALUES (?, ?)", ['lan_name', 'Tihlde LAN 2018']);
    db.run("INSERT INTO Games (game_name) VALUES (?)", ['BeatSaber']);
    db.run("INSERT INTO Games (game_name) VALUES (?)", ['Fruit Ninja']);
    db.run("INSERT INTO Scores (game_id, score, player_name) VALUES (?, ?, ?)", [1, 1337, 'Trygve55']);
    db.run("INSERT INTO Scores (game_id, score, player_name) VALUES (?, ?, ?)", [1, 1037, 'Trygve55']);
});