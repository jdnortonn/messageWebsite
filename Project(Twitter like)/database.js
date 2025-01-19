const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});
//yoooooo
// Function to get all users
function getDatas(callback) {
  pool.query("SELECT * FROM users", (err, data) => {
    if (err) return callback(err);
    callback(null, data);
  });
}

// Function to get a single user by ID
function getData(id, callback) {
  pool.query("SELECT * FROM users WHERE id = ?", [id], (err, data) => {
    if (err) return callback(err);
    callback(null, data[0]);
  });
}

// Function to create a new user
function createUser(email, username, password, callback) {
  pool.query(`
    INSERT INTO users (email, username, password)
    VALUES (?, ?, ?)
  `, [email, username, password], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
}

// Check for duplicate username
function findDuplicateUsername(username, callback) {
  pool.query(`
    SELECT * FROM users WHERE username = ?;
  `, [username], (err, data) => {
    if (err) return callback(err, null);
    callback(null, data.length > 0);
  });
}

// Check for duplicate email
function findDuplicateEmail(email, callback) {
  pool.query(`
    SELECT * FROM users WHERE email = ?;
  `, [email], (err, data) => {
    if (err) return callback(err, null);
    callback(null, data.length > 0);
  });
}

// User login
function loginUser(username, password, callback) {
  pool.query(`
    SELECT * FROM users WHERE username = ? AND password = ?;
  `, [username, password], (err, loggedUserData) => {
    if (err) return callback(err);
    if (loggedUserData.length === 0) {
      console.log("No user found with provided username");
      return callback(null, null);
    } else {
      console.log("user found", loggedUserData[0]);
      return callback(null, loggedUserData[0]);
    }
  });
}

// Create a new message
function createMessage(user, sentTo, sentMessage, callback) {
  pool.query(`
    SELECT * FROM users WHERE username = ?;
  `, [sentTo], (err, result) => {
    if (err) return callback(err);
    if (result.length === 0) return callback(null, false); // User does not exist

    pool.query(`
      INSERT INTO messages (user, sentTo, sentMessage)
      VALUES (?, ?, ?)
    `, [user, sentTo, sentMessage], (err, result) => {
      if (err) return callback(err);
      callback(null, true); // Message successfully created
    });
  });
}

// Find messages between two users
function findMessages(user1, user2, callback) {
  pool.query(`
    SELECT * FROM messages 
    WHERE (user = ? AND sentTo = ?) OR (user = ? AND sentTo = ?)
    ORDER BY timeSENT ASC;
  `, [user1, user2, user2, user1], (err, messagesArray) => {
    if (err) return callback(err);

    const htmlArray = messagesArray.map(message => {
      if (message.user === user1) {
        return `<div class="user1 message">${message.sentMessage}</div>`;
      } else if (message.user === user2) {
        return `<div class="user2 message">${message.sentMessage}</div>`;
      }
    });

    callback(null, htmlArray);
  });
}

// Find users who have sent messages to the current user
function findTextUsers(user, callback) {
  pool.query(`
    SELECT * FROM messages WHERE sentTo = ?;
  `, [user], (err, result) => {
    if (err) return callback(err);

    const userMessageHub = new Set();
    result.forEach(name => {
      userMessageHub.add(name.user);
    });

    console.log("Find text users ended");
    callback(null, userMessageHub);
  });
}

// Change user password
function changePassword(username, currPass, newPass, callback) {
  pool.query(`
    SELECT * FROM users WHERE username = ? AND password = ?;
  `, [username, currPass], (err, result) => {
    if (err) return callback(err);
    if (result.length === 0) return callback(null, false); // Incorrect password

    pool.query(`
      UPDATE users
      SET password = ?
      WHERE username = ?;
    `, [newPass, username], (err, result) => {
      if (err) return callback(err);
      callback(null, true); // Password updated
    });
  });
}

// Change user username
function changeUsername(username, newUsername, callback) {
  pool.query(`
    SELECT * FROM users WHERE username = ?;
  `, [newUsername], (err, result) => {
    if (err) return callback(err);
    if (result.length > 0) return callback(null, false); // Username already exists

    pool.query(`
      UPDATE users
      SET username = ?
      WHERE username = ?;
    `, [newUsername, username], (err, result) => {
      if (err) return callback(err);
      callback(null, true); // Username updated
    });
  });
}

// Delete user account
function deleteUser(username, password, callback) {
  pool.query(`
    SELECT * FROM users WHERE username = ? AND password = ?;
  `, [username, password], (err, result) => {
    if (err) return callback(err);
    if (result.length === 0) return callback(null, false); // Incorrect password

    pool.query(`
      DELETE FROM users
      WHERE username = ?;
    `, [username], (err, result) => {
      if (err) return callback(err);
      callback(null, true); // Account deleted
    });
  });
}

function deleteUserMessages(username,callback){
  pool.query(`
    DELETE FROM messages WHERE user = ? OR sentTo = ?;
  `, [username, username], (err, result) => {
    if (err) return callback(err);
    callback(null, true); // Messages deleted
  });
}

module.exports = {
  createUser,
  getData,
  getDatas,
  findDuplicateEmail,
  findDuplicateUsername,
  deleteUser,
  loginUser,

  createMessage,
  findMessages,
  findTextUsers,
  changePassword,
  changeUsername,
  deleteUserMessages

};
