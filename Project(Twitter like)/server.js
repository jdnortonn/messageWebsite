const express = require('express')

const cookieParser = require('cookie-parser');


const app = express()

//global user

//import {getData, getDatas, createUser} from './database.js'
//import {getUserInfo} from './public/js.js'
// import db

// must be before routes otherwise it wont parse
// the cookies
app.use(cookieParser());

app.set('view engine', 'ejs')

app.use(express.static('public'))
// used to be able to take input from 
// web page user extender to get rid
// of waringnng
app.use(express.urlencoded({extended: true}))
app.get('/', (req, res) => {
  
    // we user || because the username value needs to be set to null if
    // the cookie doesnt exist
    res.render('HomePage',{username : req.cookies.username || null})
  
  
});

// user router
const userRouter = require ("./routes/users.js")
const messagesRouter = require ("./routes/messages.js")

app.use("/user",userRouter)
app.use("/messages", messagesRouter)
//

// mesage router


//

app.get('/message', (req, res) => {
  res.render('message');
});

app.get('/settings', (req, res) => {
  if (req.cookies.username){
    return res.render('settings',{
      username : req.cookies.username 
    });
  }
  
    res.render('HomePage',{username : null})
  
  
  
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});


