const express = require("express");
const dotenv = require("dotenv");
const { graphqlHTTP } = require('express-graphql');
const fs = require('fs')
const path = require('path')

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const app = express();

const dbPath = path.join(__dirname, 'database/', 'users.json')

// env configuration
dotenv.config();

app.use(express.json());

// express graphql by default rejects options request from browsers. So when setting up response headers inside the middleware, write below code:
/*
if (req.method === 'OPTIONS') {
  res.sendStatus(200)
}
*/
// so that the browser can see 200 and send POST/PUT?PATCH/DELETE requests

// Setting up graphql
// Use customFormatErrorFn, formatError is deprecated
app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) { 
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || 'An error occurred.';
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    }
  })
);

// Index Route
app.get("/", (req, res) => {
  res.json({ msg: 'Index route' });
});

// Create / Update user route using REST API
app.post('/users', (req, res) => {
  const { username, email } = req.body
  let users
    fs.readFile(dbPath, (err, content) => {
      if (err) console.error(err)

      let parsedContent
      if (!err) {
        parsedContent = JSON.parse(content)
      }
      users = parsedContent.users

      const existingUserIndex = users.findIndex(user => user.username === username)

      let updatedUsers
      if (existingUserIndex > -1) {
        // update fields (in this case update email)
        console.log('Updating existing user')
        let existingUser = users[existingUserIndex]
        let updatedUser = {...existingUser}
        updatedUser.email = email
        users[existingUserIndex] = updatedUser
        updatedUsers = [...users]
      } else {
        // create user
        console.log('Creating new user')
        let userObj = {
          username: username,
          email: email
        }
        updatedUsers = [...users, userObj]
      }

      console.log('new users array: ', updatedUsers)
      // write to file
      fs.writeFile(dbPath, JSON.stringify({ users: updatedUsers}),  (err) => console.log(err))
    })
    res.json({ username, email });
})

// connectDb() // using json in memory file as db currently
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));