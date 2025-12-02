// mongo stuff
// Holds admin state and user info
let userAc = {}
let admin = undefined
require('dotenv').config();
// email api stuff
const Mailjet = require ('node-mailjet');
const exp = require('constants');
const mailjet = Mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
var connected = false;
var isGuest = false;
const bcrypt = require('bcryptjs');

// Function to connect to MongoDB and return the client
async function connectToMongoDB() {
    try {
      await client.connect();
      console.log('Connected to MongoDB');
      return client;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error; // You might want to handle this error in your application
    }
  }
// Function to close the MongoDB connection
async function closeMongoDBConnection() {
    try {
      await client.close();
      console.log('Error');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error; // You might want to handle this error in your application
    }
  }
  
exports.login = function(request, response){

    if (!connected) {
        connectToMongoDB()
        connected = true
      }
    
    // User cant login if already logged in
    if (request.session.user) {
        response.redirect('/index.html');
        return
    }
    response.render('login');

}

exports.signup = function(request, response){
    if (!connected) {
        connectToMongoDB()
        connected = true
      }
    
    // User cant signup if already logged in
    if (request.session.user) {
        response.redirect('/index.html');
        return
    }
   console.log("signup")
    response.render('signup');

}

// Function that uses query in url to get the pool from the database
exports.getPool = async function(request, response){ 
    /*
    //T10
    //serve up a simple index.html page
    */
   // The pool id is in the query
   const isValid = /^[0-9a-fA-F]{24}$/.test(request.query.id);
   if (!isValid) {
     return
   }
    let id = new ObjectId(request.query.id)
    console.log("id: " + id)

    // check to make sure pool is valid

    pool = ""
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Pools');
        
            // find by the id
            const query = { _id: id};
            pool = await collection.findOne(query);
            
            if (pool) {
                // We want to sort by state and then by status
                console.log('Found pool: ', pool);
                pool.Messages.sort((a, b) => {
                    const stateOrder = getStateOrder(a.state) - getStateOrder(b.state);
                    if (stateOrder !== 0) {
                        return stateOrder;
                    }
                    return getStatusOrder(a.status) - getStatusOrder(b.status);
                    });
                
                    // Render the page with the pool
                response.render('lists', {admin: request.session.admin, pools: pool });
            } else {
                // Error if the pool is not found
                response.render('lists', {error: "Error", admin: request.session.admin, });
                await client.close();
                return
            }



    } catch {
        console.log('Error');
    }

}

// Simple function to get the order of the states
function getStateOrder(state) {
    switch (state) {
        case 'Completed':
        return 1;
        default:
        return 0;
    }
}
    
// Simple function to get the order of the status
function getStatusOrder(status) {
    switch (status) {
        case 'Urgent':
        return 0;
        case 'Medium':
        return 1;
        case 'Low':
        return 2;
        default:
        return 3;
    }
}

exports.landing =  function(request, response){ 
    /*
    //T10
    //serve up a simple index.html page
    */
   // Renders the landing page
    response.render('landing', { admin: request.session.admin, pools: request.session.userAc.pools });
}

exports.guestLogin = async function(request, response){ 

    // Need to create example data for the client
    // server will delte account after 1 hour

    // template to store the new user
    let data = {
        _id: new ObjectId(),
        userName: Math.random().toString(36).slice(-8),
        password: "password",
        level: "user",
        email: "test@gmail.com",
        pools: [],
        expireAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
    }

    let pool = {
        _id: new ObjectId(),
        poolName: "House Chores",
        Messages: [{toDo:"Fix Faucet",state:"In progress",status:"Urgent",mID: data._id, _id: new ObjectId()},{toDo:"Put Christmas Lights Up",state:"In progress",status:"Low",mID: data._id, _id: new ObjectId()},
        {toDo:"Unclog Drain",state:"Completed",status:"Urgent",mID: data._id, _id: new ObjectId()} ],
        emails: ["test@gmail.com"],
        expirationDate:new Date(Date.now() + 1 * 60 * 60 * 1000),
    }

    let pool2 = {
        _id: new ObjectId(),
        poolName: "Garden Chores",
        Messages: [{toDo:"Plant Patunias",state:"In progress",status:"Urgent",mID: data._id, _id: new ObjectId()},{toDo:"Mow Lawn",state:"In progress",status:"Low",mID: data._id, _id: new ObjectId()},
        {toDo:"Move Rocks",state:"Completed",status:"Urgent",mID: data._id, _id: new ObjectId()} ],
        emails: ["test@gmail.com"],
        expirationDate:new Date(Date.now() + 1 * 60 * 60 * 1000),
    }

    data.pools.push({poolID: pool._id, poolName: pool.poolName})
    data.pools.push({poolID: pool2._id, poolName: pool2.poolName})
      var authorized = false;
      //check database users table for user
      try {
          console.log('Connected correctly to server');
          const db = client.db('Todo');
          const collection = db.collection('Users');

            // Checks if user name is taken
            const result = await collection.insertOne(data);
            authorized = true;
            request.session.userAc = data;
            isGuest = true;

            const dbPool = client.db('Todo');
            const collectionPool = dbPool.collection('Pools');
            await collectionPool.insertOne(pool);
            await collectionPool.insertOne(pool2);
      } catch {
          console.log('Error');
      }

      // Go in circle if not authorized
      if (authorized===false) {
        // User:password is not valid, redirect to the login page
        response.render('login', { error: 'Error Creating Guest Account' } )
        } else {
            //response.redirect('/index.html');
            response.redirect('/index.html');
        }



}

exports.postLogin = async function(request, response){
    // uses body parser to get the username and password
    const { username, password } = request.body;
    
    console.log("User: ", username + " Password: ", password);
    // Error checking
    if (username === undefined || password === undefined || username === "" || password === "") {
        return response.render('login', {error: ""});
    }

        console.log("User: ", username + " Password: ", password);
      var authorized = false;
      //check database users table for user
      try {
          console.log('Connected correctly to server');
          const db = client.db('Todo');
          const collection = db.collection('Users');
          const query = { userName: username };
          const user = await collection.findOne(query);

          // finding user and checking password
          if (user) {
              console.log('Found user: ', user);
              if (user.password == password) {
                  console.log('User is authorized');
                  authorized = true;
                  request.session.userAc = user;
              } else if (bcrypt.compare(user.password, password)) {
                console.log('User is authorized');
                authorized = true;
                request.session.userAc = user;
              }
          }

      } catch {
          console.log('Error');
      }

      // Go in circle if not authorized
      if (authorized===false) {
        // User:password is not valid, redirect to the login page
        response.render('login', { error: 'Incorrect Username or Password' } )
        } else {
            //response.redirect('/index.html');
            // request.session.userAc = userAc;
            if (request.session.userAc.level === "admin") {
                admin = true
                request.session.admin = true
            }
            response.redirect('/index.html');
        }
    //   next();
    // response.redirect('/index.html');
}

exports.postSignup = async function(request, response){

    // uses body parser to get the username and password
    const { username, password, email } = request.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // template to store the new user
    let data = {
        _id: new ObjectId(),
        userName: username,
        password: hashedPassword,
        level: "user",
        email: email,
        pools: []
    }

    console.log("User: ", username + " Password: ", password);
    // error checking
    if (username === undefined || password === undefined || username === "" || password === "" || email === undefined || email === "") {
        response.render('signup', {error: ""});
        return
    }

    // regex for validating an Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test if the email matches the pattern
    if (!emailRegex.test(data.email)) {
        response.render('signup', {error: "Email is in the wrong format"});
        return
    }

        console.log("User: ", username + " Password: ", password);
      var authorized = false;
      //check database users table for user
      try {
          console.log('Connected correctly to server');
          const db = client.db('Todo');
          const collection = db.collection('Users');
          const query = { userName: username };
          const user = await collection.findOne(query);

          if (!user) {
            // Checks if user name is taken
            const result = await collection.insertOne(data);
            authorized = true;
            request.session.userAc = data;
          }

      } catch {
          console.log('Error');
      }

      // Go in circle if not authorized
      if (authorized===false) {
        // User:password is not valid, redirect to the login page
        response.render('signup', { error: 'Username is taken' } )
        } else {
            //response.redirect('/index.html');
            request.session.user = userAc;
            if (request.session.userAc.level === "admin") {
                admin = true
            }
            response.redirect('/index.html');
        }
}


exports.addPool = async function(request, response){ 
    /*
    //T10
    //serve up a simple index.html page
    */
   let id = new ObjectId(request.query.id)
   console.log("id: " + id)
   let poolFinal = {}
   pool = {}

   // Get the pool from the database and make sure it exists
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Pools');

            const update = {
            $push: {
                emails: request.session.userAc.email},
            };

            const options = {
                returnDocument: 'after', // Return the updated document
              };

            const query = { _id: id};
            pool = await collection.updateOne(query, update, options);
          
            if (pool.matchedCount === 0) {
                response.render('landing', { admin: request.session.admin, error: "Invalid ID", pools: request.session.userAc.pools });
                return
            } 


    } catch {
        console.log('Error');
    }
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Pools');

            const query = { _id: id};
            pool = await collection.findOne(query);

    } catch {
        console.log('Error');
    }

    console.log("email" + request.session.userAc.email)
    console.log("pool              a " + poolFinal.poolName)
    // template to add the pool to the user
    const update = {
        $push: {
          pools: {poolID: id,
             poolName: pool.poolName},
        },
        };

    // What we want to add to the user
    const toAdd = {
        poolID: id,
        poolName: pool.poolName,
    }

    // Adding the pool info to the user
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Users');
        const query = { _id: new ObjectId(request.session.userAc._id)};
        console.log(query)
        console.log(update)
        const result = await collection.updateOne(query, update);
        console.log(result)

    } catch {
        console.log('Error');
    }

    // Adding the pool info to our local user
    request.session.userAc.pools.push(toAdd)
    response.render('landing', {admin: request.session.admin, pools: request.session.userAc.pools });

}

exports.addMessage = async function(request, response){

    let jsonObject = request.body;
    console.log("jsonObject: " + JSON.stringify(jsonObject))
    console.log("id: " + jsonObject.id)
   let id = new ObjectId(jsonObject.id)
   let poolFinal = {}
   pool = ""

   // Template to uodate and add the message to the pool
   const update = {
    $push: {
      Messages: {
        toDo: jsonObject.toDo,
         state: jsonObject.state,
         status: jsonObject.status,
        mID: new ObjectId(request.session.userAc._id),
        _id: new ObjectId(),},
     },
    }
    let emails = []

    // Add the message to the pool
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Pools');
        const query = { _id: id};
        emails = await collection.findOne(query)
        console.log(emails)
        const result = await collection.updateOne(query, update);
        console.log(result)
        //response.redirect(`/getPool?id=${id}`);

    } catch {
        console.log('Error');
    }

    if (emails.emails.length === 0) {
        // error if there are no emails
        response.json({ message: 'POST request received successfully With Errors' });
        return
    }

    // Send emails to all the emails in the pool
    for (var i = 0; i < emails.emails.length; i++) {
        console.log(emails.emails[i])
        sendEmail(emails.emails[i], jsonObject.toDo, jsonObject.state, emails.poolName)
    }



    response.json({ message: 'POST request received successfully' });

}

// Checks if the user is an admin and renders the admin page
exports.admin = async function(request, response){
    if (request.session.userAc.level != "admin") {
        response.send("You are not an admin")
        return
    }
    // Get all the users from db
    let userArr = []
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Users');
        const query = { level: "user"};
        const result = await collection.find().toArray();
        console.log(result)
        userArr = result

    } catch {
        console.log('Error');
    }
    response.render('admin', {users: userArr});
}

// Updates the status of the message
exports.updateStatus = async function(request, response){
    let jsonObject = request.body;
    console.log("jsonObject: " + JSON.stringify(jsonObject))
    console.log("jsonObject: " + jsonObject.parentID)
    console.log("jsonObject: " + jsonObject.id)
   let id = new ObjectId(jsonObject.parentID)
   let arrayElementId = new ObjectId(jsonObject.id)
   console.log("id: " + id)
   pool = ""

   // Filter to find message
   const filter = {
    _id: id,
    'Messages._id': new ObjectId(arrayElementId)
    };

    // Update to change the state
   const update = {
    $set: {'Messages.$.state': jsonObject.state}
    }

    // Update the message
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Pools');

        const result = await collection.updateOne(filter, update);
        console.log(result)
        //response.redirect(`/getPool?id=${id}`);

    } catch {
        console.log('Error');
    }


    response.json({ message: 'POST request received successfully' });
}

// api to send email
function sendEmail(email, text, state, name) {
    const request = mailjet
        .post("send", {'version': 'v3.1'})
        .request({
            "Messages":[
                    {
                            "From": {
                                    "Email": "todo-alert-push-notify-noreplies@outlook.com",
                                    "Name": "Todo Alerts"
                            },
                            "To": [
                                    {
                                            "Email": `${email}`,
                                            "Name": ""
                                    }
                            ],
                            "Subject": "You have a new task to Do!",
                            "HTMLPart": `<h3> You have a new Task! !</h3> <br/> List: ${name}<pr/> <br/>Your Task: ${text}<pr/> <br/>State: ${state} <br/> Check your todo List!`
                    }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
        })
        .catch((err) => {
            console.log(err.statusCode)
        })
}

// creates a new group
exports.createGroup = async function(request, response){ 
    /*
    //T10
    //serve up a simple index.html page
    */
    let jsonObject = request.body;

    // template to create a new pool
   let pools = {
    _id: new ObjectId(),
    poolName: jsonObject.message,
    Messages: [],
    emails: [request.session.userAc.email]
   }
   let pool = {}
   // First make the pool
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Pools');

        pool = await collection.insertOne(pools);
        console.log(pool)

    } catch {
        console.log('Error');
    }

    const update = {
        $push: {
          pools: {poolID: pool.insertedId,
             poolName: jsonObject.message,},
        },
        };
    const toAdd = {
            poolID: pool.insertedId,
            poolName: jsonObject.message
    }
    // Then add the pool to the user
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Users');
        const query = { _id: new ObjectId(request.session.userAc._id)};
        const result = await collection.updateOne(query, update);
        console.log(result)

    } catch {
        console.log('Error');
    }
    // Add it tothe local array
    request.session.userAc.pools.push(toAdd)
    response.json({ message: 'POST request received successfully' });
    
}

// Logs client out and destroys session
exports.logout = async function(request, response){
    request.session.destroy();
    response.redirect('/login');
}

// Displayes simple account info
exports.account = async function(request, response){
    response.render('account', {username: request.session.userAc.userName, email: request.session.userAc.email});
}

// Short info about the app
exports.about = async function(request, response){
    response.render('about');
}

// Deletes a message
exports.deleteMessage = async function(request, response){
    let jsonObject = request.body;
    console.log("jsonObject: " + JSON.stringify(jsonObject))
    console.log("jsonObject: " + jsonObject.parentID)
    console.log("jsonObject: " + jsonObject.id)
   let id = new ObjectId(jsonObject.parentID)
   let arrayElementId = new ObjectId(jsonObject.id)
   console.log("id: " + id)
   let poolFinal = {}
   pool = ""

   const filter = {
    _id: id,
    'Messages._id': new ObjectId(arrayElementId)
    };

    const update = {
        $pull: {
          Messages: {
            _id: arrayElementId,
          },
        },
      };

      // Finds the message by the message id and deletes it
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Pools');

        const result = await collection.updateOne(filter, update);
        console.log(result)
        //response.redirect(`/getPool?id=${id}`);
        if (result.modifiedCount === 0) {
            response.json({ message: 'POST request received successfully With Errors' });
            return
        }

    } catch {
        console.log('Error');
    }


    response.json({ message: 'POST request received successfully' });

}

exports.deleteAccount = async function(request, response){
    // get user ID stored in the server
    // search mongo db users for id 
    // delete user
    // go to login page
    console.log("delete account")
    try {
        console.log('Connected correctly to server');
        const db = client.db('Todo');
        const collection = db.collection('Users');
        console.log("current id" + request.session.userAc._id)
        const query = { _id: new ObjectId(request.session.userAc._id)};
        console.log(query)
        const result = await collection.deleteOne(query);
        console.log(result)

    } catch {
        console.log('Error');
    }
    request.session.destroy();
    
    response.redirect('/login');


}
