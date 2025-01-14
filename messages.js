const express = require('express');
const router = express.Router();
const cookie = require('cookie');
const db = require('../database.js'); // Assuming this is where database functions are imported
const { render } = require('ejs');

// Use the public folder for static files
router.use(express.static('public'));

// Home route (messages page)
router.get('/', (req, res) => {
    res.render('userMessages.ejs'); // Render the messages tab
    console.log('Messages page rendered');
});

// Send message page (GET request)
router.get('/send', (req, res) => {
    if (req.cookies.username) {
        console.log('Create message page rendered');
        return res.render('createMessage.ejs'); // Render the message creation page
    }

    // If the user is not logged in, render the home page with no username
    return res.render('HomePage.ejs', {
        username: null
    });
});

// Handle sending a message (POST request)
router.post('/send', (req, res) => {
    const user = req.cookies.username; // Get the logged-in user from cookies
    
    if (!user) {
        console.log('User not logged in');
        return res.redirect('/user/login'); // Redirect to login if no user cookie found
    }

    const { sentTo, sentMessage } = req.body; // Get the recipient and message content

    console.log('Message creation function called');
    
    // Save the message using the database function (async operation)
    db.createMessage(user, sentTo, sentMessage, (err, sendToExists) => {
        if (err) {
            console.log('Error sending message:', err);
            return res.sendStatus(500); // Handle database error
        }

        // If the recipient doesn't exist, handle this case
        if (!sendToExists) {
            console.log('User does not exist');

            // Retrieve users that the logged-in user has texted before
            db.findTextUsers(user, (err, stringSet) => {
                if (err) {
                    console.log('Error fetching user data:', err);
                    return res.sendStatus(500); // Handle database error
                }

                return res.render('newMessageHub.ejs', {
                    stringSet: stringSet || null, 
                    found: false // Indicating that no recipient was found
                });
            });

            return;
        }

        // If the message is successfully created, redirect to the messages page
        console.log(`Message created for ${sentTo}`);
        return res.redirect(`/messages/test/${sentTo}`);
    });
});



// Route to display messages for a particular recipient (GET request with dynamic URL)
router.get('/test/:id', (req, res) => {
    const sendTo = req.params.id;
    const currentUser = req.cookies.username;

    if (!currentUser) {
        console.log('User not logged in');
        return res.redirect('/user/login');
    }

    console.log(sendTo);

    // Fetch messages between the logged-in user and the recipient
    db.findMessages(currentUser, sendTo, (err, stringArray) => {
        if (err) {
            console.log('Error finding messages:', err);
            return res.sendStatus(500); // Handle database error
        }

        // Render messages to be displayed
        res.render('messagesDisplayActualText.ejs', {
            array: stringArray,
            sentTo: sendTo
        });

        console.log(`Messages found for ${sendTo}`);
    });
});

// Route for handling the message hub page (users you have texted)
router.get('/test', (req, res) => {
    const user = req.cookies.username;

    if (user) {
        // If the user is logged in, find users they've texted
        db.findTextUsers(user, (err, stringSet) => {
            if (err) {
                console.log('Error:', err);
            }

            console.log('Before render');
            res.render('newMessageHub.ejs', {
                stringSet: stringSet || null,
                found: true // Indicating that users have been found
            });
        });

        console.log('Message finding function finished');
    } else {
        // If the user is not logged in, render the home page
        res.render('HomePage.ejs', {
            username: null
        });
    }
});

// Route for a specific recipient's messages
router.get('/test/:id', (req, res) => {
    const sendTo = req.params.id;
    const currentUser = req.cookies.username;

    console.log(sendTo);

    db.findMessages(currentUser, sendTo, (err, stringArray) => {
        if (err) {
            console.log('Error finding messages:', err);
            return res.sendStatus(500); // Handle database error
        }

        // Render messages to be displayed
        res.render('messagesDisplayActualText.ejs', {
            array: stringArray,
            sentTo: sendTo
        });

        console.log(`Messages found for ${sendTo}`);
    });

    console.log('Message finding function finished');
});

module.exports = router;
