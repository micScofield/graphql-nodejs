const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type User {
        username: String!
        email: String!
    }

    input UserInputData {
        username: String!
        email: String!
    }
    type testData {
        message: String!
    }

    " comment "
    type RootQuery {
        "comment"
        hello: testData
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
