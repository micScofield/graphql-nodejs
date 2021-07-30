const fs = require("fs");
const path = require("path");
const validator = require('validator')

const dbPath = path.join(__dirname, "../", "database/", "users.json");

module.exports = {
  hello() {
    return { message: "Hello World !" };
  },
  createUser: function ({ userInput }) {
    console.log("User Input in createUser resolver", userInput);

    // Add input validation here
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "E-Mail is invalid." });
    }
    if (
      validator.isEmpty(userInput.username) ||
      !validator.isLength(userInput.username, { min: 2 })
    ) {
      errors.push({ message: "Username too short!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422; // or 400
      throw error;
    }

    // If no errors, proceed with below:-
    let users;
    fs.readFile(dbPath, (err, content) => {
      if (err) console.error(err);

      let parsedContent;
      if (!err) {
        parsedContent = JSON.parse(content);
      }
      users = parsedContent.users;

      const existingUserIndex = users.findIndex(
        (user) => user.username === userInput.username
      );

      let updatedUsers;
      if (existingUserIndex > -1) {
        // update fields (in this case update email)
        console.log("Updating existing user");
        let existingUser = users[existingUserIndex];
        let updatedUser = { ...existingUser };
        updatedUser.email = userInput.email;
        users[existingUserIndex] = updatedUser;
        updatedUsers = [...users];
      } else {
        // create user
        console.log("Creating new user");
        let userObj = {
          username: userInput.username,
          email: userInput.email,
        };
        updatedUsers = [...users, userObj];
      }

      console.log("new users array: ", updatedUsers);
      // write to file
      fs.writeFile(dbPath, JSON.stringify({ users: updatedUsers }), (err) =>
        console.log(err)
      );
    });
    return { username: userInput.username, email: userInput.email };
  },
};
