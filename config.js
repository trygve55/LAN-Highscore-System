const secret = Math.random().toString(36).substring(7);


module.exports = {
    secret,
    port: 8080,
    minPlayerNameLength: 3,
    username: "admin",      //chnage this!
    password: "admin"       //and this!
};
