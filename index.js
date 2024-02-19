var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
    type User {
        _id: ID!
        username: String!
        email: String!
        password: String!
    }

    type Employee {
        _id: ID!
        first_name: String!
        last_name: String!
        email: String!
        gender: String!
        salary: Float!
    }

    type Mutation {
        signup(username: String!, email: String!, password: String!): User
        addEmployee(first_name: String!, last_name: String!, email: String!, gender: String!, salary: Float!): Employee
        updateEmployee(_id: ID!, first_name: String!, last_name: String!, email: String!, gender: String!, salary: Float!): Employee
        deleteEmployee(_id: ID!): Boolean
    }

    type Query {
        login(usernameOrEmail: String!, password: String!): User
        getAllEmployees: [Employee]
        searchEmployeeById(_id: ID!): Employee
    }`);

const { MongoClient, ObjectId } = require('mongodb');

const mongoURI = 'mongodb+srv://algor:algor123@cluster0.rlt4hjr.mongodb.net/';
const client = new MongoClient(mongoURI);

client.connect();

var signup = async ({ username, email, password }) => {
      const userCollection = client.db('comp3133_assignment1').collection('Users');
      const result = await userCollection.insertOne({ username, email, password });
      console.log(result.insertedId)
      return result.insertedId;
    }
var addEmployee = async ({ first_name, last_name, email, gender, salary }) => {
      const employeeCollection = client.db('comp3133_assignment1').collection('Employee');
      const result = await employeeCollection.insertOne({ first_name, last_name, email, gender, salary });
      return result.insertedId;
    }
var updateEmployee = async ({ _id, first_name, last_name, email, gender, salary }) => {
      const employeeCollection = client.db('comp3133_assignment1').collection('Employee');
      const result = await employeeCollection.findOneAndUpdate(
        { _id:  new ObjectId(String(_id)) }, 
        { $set: { first_name, last_name, email, gender, salary } },
        { returnDocument: 'after' }
      );
      return result;
    }
var deleteEmployee = async ({ _id }) => {
      const employeeCollection = client.db('comp3133_assignment1').collection('Employee');
      const result = await employeeCollection.deleteOne({ _id: new ObjectId(String(_id)) });
      return result.deletedCount === 1;
    }
var login = async ({ usernameOrEmail, password }) => {
      const userCollection = client.db('comp3133_assignment1').collection('Users');
      const user = await userCollection.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        password,
      });
      return user;
    }
var getAllEmployees = async () => {
      const employeeCollection = client.db('comp3133_assignment1').collection('Employee');
      const employees = await employeeCollection.find().toArray();
      return employees;
    }
var searchEmployeeById = async ({ _id }) => {
      const employeeCollection = client.db('comp3133_assignment1').collection('Employee');
      const employee = await employeeCollection.findOne({ _id: new ObjectId(String(_id)) });
      return employee;
    }

var root = {
    signup: signup,
    addEmployee: addEmployee,
    updateEmployee: updateEmployee,
    deleteEmployee: deleteEmployee,
    login: login,
    getAllEmployees: getAllEmployees,
    searchEmployeeById: searchEmployeeById
}

var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: false
}));

app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));