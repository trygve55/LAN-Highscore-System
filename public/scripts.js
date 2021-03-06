var socket;

function getGameId() {
    return window.location.pathname.split("/").pop();
}

function addHighscore(highscore, playerName) {
    fetch('/api/games/' + getGameId() + '?token=' + localStorage.token, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({score : highscore, playerName : playerName})
    }).then(
        response => location.reload()
    ).catch(
        error => console.log(error) // Handle the error response object
    );
}

function addGame(gameName) {
    fetch('/api/games?token=' + localStorage.token, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({game_name : gameName})
    }).then(
        response => location.reload()
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
        response => location.reload()
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
    fetch('/api/games/' + gameId + '?token=' + localStorage.token, {
        method: 'DELETE',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).then(
        response => location.reload()
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
    ).then(
        test => location.reload()
    ).catch(
        error => alert('Login failed.') // Handle the error response object
    );
}

function addNewHighscore() {
    addHighscore(document.getElementById("newHighscore").value, document.getElementById("newPlayerName").value);
    location.reload();
}

function removeOldHighscore(highscoreId) {
    removeHighscore(highscoreId);
}

function addNewGame() {
    addGame(document.getElementById("newGame").value);
    location.reload();
}

function removeOldGame(event, gameId) {
    event.stopPropagation();
    removeGame(gameId);
}

function showLoginLogout() {
    if (localStorage.token)
        return logout();

    loginForm = document.getElementById('loginForm');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'inline';
        document.getElementById('username').focus();

        var inputsLogin = document.getElementsByClassName('loginInput');

        for(var i = 0; i < inputsLogin.length; i++) {
            inputsLogin[i].addEventListener("keyup", function(event) {
                if (event.keyCode === 13)
                    document.getElementById("loginButton").click();
            });
        }

    } else
        loginForm.style.display = 'none'
}

function sendLogin() {
    login(document.getElementById('username').value, document.getElementById('password').value);
}

function logout() {
    localStorage.removeItem('token');
    location.reload();
}

function checkLogin() {
    fetch('/api/login?token=' + localStorage.token, {
        method: 'GET',
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(
        response => {
            if (response.status === 403)
                logout();
        }
    ).catch(
        error => console.log(error)
    );
}

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {

        setTimeout(function () {
            socket = io(window.location.host);

            socket.on('update', function(msg){
                console.log(msg);
                if (location.pathname === '/' || msg == getGameId()) {
                    location.reload();
                }
            });
        }, 200);

        if (localStorage.token) {

            checkLogin();

            var elm = document.getElementsByClassName("hiddenAdmin");
            for (let i = 0; i < elm.length;) {
                elm[0].classList.remove("hiddenAdmin")
            }

            var inputs = document.getElementsByClassName('tableInput');

            for(var i = 0; i < inputs.length; i++) {
                inputs[i].addEventListener("keyup", function(event) {
                    event.preventDefault();
                    if (event.keyCode === 13) {
                        document.getElementById("submitButton").click();
                    }
                });
            }

            document.getElementById('showLoginButton').innerText = 'Logout';
        }
    }
};