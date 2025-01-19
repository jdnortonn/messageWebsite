// use a set since it has a funciton that can easily search the set to see if 
//it has unquieness which is what we want for uqnie usernames
const usernameList = new Set();
// a array to store the object of user itself
const user = [];

let currentUser = {
    userName: null,
    password: null
}


function createUser (userName,password) {
    if (usernameList.has(userName)){
        console.log("user name already taken");
        return;
    }
    let newUser = {userName ,password}
    user.push(newUser);
    usernameList.add(userName);
    console.log(newUser);

    // loggined in?
    let logged = false;
}

function promptUser(){
    let user = prompt("Create your username");
    let password = prompt("Create your password");
    
    let newUser = new createUser(user,password);
    
}

function loginUser(){
    // ask for login
    let inputUser = prompt("Enter your username: ");
    let inputPass = prompt("Enter your password: ");
    // check the set if we have an account with the user name
    if (usernameList.has(inputUser)){
        // iterate throuh our array of account objects
        let i = 0;
        while (i < user.length){
            // check if user and pass are correct to the account
            if (inputUser == (user[i]).userName && inputPass == (user[i]).password){
                console.log("Login successfull");
                logged = true;
                
                currentUser.userName = user[i].userName;
                currentUser.password = user[i].password;
                
                break;
            }
            // throw error if user name is right but password is wrong
            else if (inputUser == (user[i]).userName){
                console.log("wrong password");
            }
            i++;
        }
    }
    else {
        console.log("Username not found");
    }
}
function setUser(inputUser){

}
function getUser(inputUser){
    let i = 0;
    while (i < user.length){
        if (user[i].userName == inputUser){
            return user[i];
        }
    }
}
function displayUser(){
    if (logged){
        let display = document.getElementById("Logged");
        
        display.innerText = `User ${currentUser.userName} is logged in`; 
    }
}

export function getUserInfo(){
    // email,username,message,password,bio
    let user = []
     user[0] = prompt("Create your username");
     user[1] = prompt("Create your password");
     user[2] = prompt("Enter your email");
     user[3] = "message text";
     user[4] = "bio text";
     return user;
}