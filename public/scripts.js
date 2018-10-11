function getGameId() {
    return window.location.pathname.split('/')[2];
}

function addHighscore(highscore, playerName) {
    fetch('/api/games/' + getGameId() + '?token=' + localStorage.token, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({score : highscore, playerName : playerName})
    }).then(
        response => console.log(response)
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

function addGame(gameName, playerName) {
    fetch('/api/games?token=' + localStorage.token, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({game_name : gameName})
    }).then(
        response => console.log(response)
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

function resetHighscore(gameId) {
    fetch('/api/games/' + gameId + '/reset?token=' + localStorage.token, {
        method: 'DELETE',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).then(
        response => console.log(response)
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

function removeHighscore(highscoreId) {
    fetch('/api/games/' + getGameId() + '/' + highscoreId + '?token=' + localStorage.token, {
        method: 'DELETE',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).then(
        response => console.log(response)
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

function removeAllGames() {
    fetch('/api/games?token=' + localStorage.token, {
        method: 'DELETE',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).then(
        response => console.log(response)
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

function removeGame(gameId) {
    fetch('/api/games/' + getGameId() + '/reset?token=' + localStorage.token, {
        method: 'DELETE',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).then(
        response => console.log(response)
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}


function login(username, password) {
    fetch('/api/login', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username : username, password : password})
    }).then(
        response => response.json() // if the response is a JSON object
    ).then(
        success => localStorage.token = success.token
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

function addNewHighscore() {
    addHighscore(document.getElementById("newHighscore").value, document.getElementById("newPlayerName").value);
    location.reload();
}

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        if (localStorage.token) {
            document.getElementById("addNew").classList.remove("hidden");
        }
    }
};