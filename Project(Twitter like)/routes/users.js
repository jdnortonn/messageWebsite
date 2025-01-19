const express = require('express')
const router = express.Router()


const db = require('../database.js')
// create a login function
router.get('/login', (req, res) => {
    // check if user is logged in already with cookies
    if (req.cookies.username){
        
        res.redirect(`/`)
     }
    res.render('login',{
        prevAttempt : true
    }) // Make sure signup.ejs exists in your views folder
    
})

router.post('/login', (req, res) => {
     // Make sure signup.ejs exists in your views folder
     
    console.log('login post called')
    

    const {username, password} = req.body
    console.log(req.body);
    
  

    
    db.loginUser(username,password,(err,loggedUserData)=>{
        if (err){
            //console.log(err)
           return res.sendStatus(500);
        }
        if (loggedUserData === null){
            console.log('calling redirect!!')
            
            return res.render('login', { prevAttempt: false });
            
        }
        else {
            console.log(`${loggedUserData} logged in `)

            // Set the username cookie after successful login
            res.cookie('username', username, {
                maxAge: 3600000   // Cookie expires in 1 hour (in milliseconds)
            });
            // cookies is the name used when parsering in cookie parser
            
            return res.redirect(`/`);
        }
        
    }

)}
)
// Create logout button


router.get('/logout',(req,res) => {
    console.log('Logout called')
    res.clearCookie('username')
    res.redirect('/')
})





router.get('/new', (req, res) => {
    res.render('signup') // Make sure signup.ejs exists in your views folder
        
})
// Route for rendering the signup form
router.post('/new', (req, res) => {
   
        const {email, username, password} = req.body
        db.findDuplicateEmail(email, (err, emailTaken) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.sendStatus(500);
        }

        db.findDuplicateUsername(username, (err, usernameTaken) => {
            if (err) {
                console.error('Error checking username:', err);
                return res.sendStatus(500);
            }

            if (!emailTaken && !usernameTaken) {
                db.createUser(email, username, password, (err, userId) => {
                    if (err) {
                        console.log('Error creating account:', err);
                        return res.sendStatus(500);
                    }
                    res.cookie('username', username, {
                        maxAge: 3600000   // Cookie expires in 1 hour (in milliseconds)
                    });
                    // create a cookie which will now be avaiable everywhere since we added the path=/ attribute
                    

                    console.log('Creation success');
                    // redirct the page to user/id
                    return res.redirect(`/`);
                });
            } else {
                if (usernameTaken) {
                    console.log('Username taken');
                    return res.status(400).send('Username is already taken.');
                }
                if (emailTaken) {
                    console.error('Email taken');
                    return res.status(400).send('Email is already taken.');
                }
            }
        });
    });
});



// allow user to change password in database
router.get('/password',(req,res)=>{
res.render('changePassword.ejs',{
    newpassCheck : true,
    passCheck : true
})
})
router.post('/password',(req,res)=>{
    // delcare values needed
    const {currentpassword,newpassword,newpassword2} = req.body
    const username = req.cookies.username
    console.log(req.body)
    // add a password check to make sure user is adding the right password

    if (newpassword != newpassword2){
        console.log('calling password retry screen')
        return res.render('changePassword.ejs',{
            newpassCheck : false,
            passCheck : true
        })
    }
    // call function to checl users old passwordis correct and
    //then call fucntioon to change password to what user entered
    console.log("calling checkpassword function")
        db.changePassword(username,currentpassword,newpassword,(err,check)=>{
            if (err){
                return console.log(`database error: ${err}`)
            }
            if (!check){
                return res.render('changePassword.ejs',{
                    newpassCheck : true,
                    passCheck : false
                })
            }
            
            if (check){
                console.log('password has been changed')
                
                return res.render('HomePage.ejs',{
                    username : username
                })
            }
            
            
            
    })
    
    
})
// basically the same as password but
// less security only checking if new username has 
// been taken if not replace
router.get('/username',(req,res)=>{
    res.render('changeUsername.ejs',{
        newUsername : true
    })
    })
    router.post('/username',(req,res)=>{
        // delcare values needed
        
        const {newUsername} = req.body
        const username = req.cookies.username
        console.log(newUsername)
        
        console.log('calling change username')
        db.changeUsername(username,newUsername,(err,check)=>{
                if (err){
                    return console.log(`database error: ${err}`)
                }
                if (!check){
                    return res.render('changeUsername.ejs',{
                        newUsername : false
                    })
                }
                
                if (check){
                    console.log('username has been changed')
                    res.cookie('username', newUsername, {
                        maxAge: 3600000   // Cookie expires in 1 hour (in milliseconds)
                    });
                    return res.render('HomePage.ejs',{
                        username : newUsername
                    })
                }
                
                
                
        })
        
        
    })    
    
// search to see if password right 
// allow user to change password in database
router.get('/delete',(req,res)=>{
    res.render('deleteUser.ejs',{
        wrongPassword : true
        
    })
    })
    router.post('/delete',(req,res)=>{
        // delcare values needed
        const {password} = req.body
        const username = req.cookies.username
        console.log(req.body)
        // add a password check to make sure user is adding the right password
    
        
        // call function to checl users old passwordis correct and
        //then call fucntioon to change password to what user entered
        
            db.deleteUser(username,password,(err,check)=>{
                if (err){
                    return console.log(`database error: ${err}`)
                }
                if (!check){
                    return res.render('deleteUser.ejs',{
                        wrongPassword : false
                    })
                }
                
                if (check){
                    console.log('account has been deleted')
                    db.deleteUserMessages(username,(err,result)=>{
                        if (err){
                            console.log("db error on deleting messages")
                        }
                        console.log('messages deleted')
                    })
                    res.clearCookie('username')
                    return res.render('HomePage.ejs',{
                        username : null
                    })
                }
                
                
                
        })
        
        
    })

// Dynamic routes for user operations
// it keeps running this even though its not specfically it
router.route('/:id')
    .get((req, res) => {
       
            const userId = req.params.id
            // check if input is an interger value
        if(isNaN(userId)){ 
            return res.status(500).send('Invalid ID')            
        }
            
        

            db.getData(userId, (err,userInfo) =>{
                if (err) {
                    console.error('Error fetching user: ',err)
                    return res.sendStatus(500)
                }
                // it tries  calling this for somereason
                if (!userInfo){
                    console.log('Error user not found')
                    return res.sendStatus(404)
                    
                }
                res.send(`Success!  ${userInfo.username}`)
                console.log('Fetched user info:', userInfo)
                    })
    })
    .put((req, res) => {
        const userId = req.params.id
        res.send(`Update user with id ${userId}`)
    })
    .delete((req, res) => {
        const userId = req.params.id
        db.deleteUser(userId, (err,deleteInfo)=>{
            if (err){
                console.log('could not find account')
            }
            db.getDatas((err,dataa)=>{
                if (err){
                    console.log('could not display data')
                }
                            console.log(data)
                        })
    callback(null, data);
    
        })
        res.send(`Delete user with id ${userId}`)
    })
   
   
    
   
  

module.exports = router

 