const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://algor:algor123@cluster0.rlt4hjr.mongodb.net/';
mongoose.connect(mongoURI);

const User = mongoose.model('User', {
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

const Employee = mongoose.model('Employee', {
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
    },
    salary: {
        type: Number,
        required: true,
    }
});

const schema = buildSchema(`
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
    }
`);

const root = {
    signup: async ({ username, email, password }) => {
        const user = new User({ username, email, password });
        await user.save();
        return user;
    },
    addEmployee: async ({ first_name, last_name, email, gender, salary }) => {
        const employee = new Employee({ first_name, last_name, email, gender, salary });
        await employee.save();
        return employee;
    },
    updateEmployee: async ({ _id, first_name, last_name, email, gender, salary }) => {
        const employee = await Employee.findByIdAndUpdate(
            _id,
            { first_name, last_name, email, gender, salary },
            { new: true }
        );
        return employee;
    },
    deleteEmployee: async ({ _id }) => {
        const result = await Employee.deleteOne({ _id });
        return result.deletedCount === 1;
    },
    login: async ({ usernameOrEmail, password }) => {
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            password,
        });
        return user;
    },
    getAllEmployees: async () => {
        const employees = await Employee.find();
        return employees;
    },
    searchEmployeeById: async ({ _id }) => {
        const employee = await Employee.findById(_id);
        return employee;
    },
};

const app = express();
const cors = require('cors');
app.use('/graphql', cors(), graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: false,
}));

app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));
