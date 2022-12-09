const { AuthenticationError } = require('apollo-server-express');
const {User, Book} = require('../models');
const {signToken} = require('../utils/auth');

const resolvers = {
    Query: {
        user: async function(parent, {username}) {
            return User.findOne({username}).populate('savedBooks');
        },

    },

    Mutation: {
        login: async function(parent, {email, password}) {
            const user = await User.findOne({email});

            if(!user) {
                throw new AuthenticationError('No usser Found with this email');
            }

            const validPassword = await user.isCorrectPassword(password);

            if(!validPassword) {
                throw new AuthenticationError('Incorrecct credentials');
            }

            const token = signToken(user);

            return {token, user};
        },
        addUser: async function(parent, {username, email, password}) {
            const user = await User.create({username, email, password});
            const token = signToken(user);
            return {token, user};
        },
        saveBook: async function(parent, {username, book}, context) {
            if(context.user) {
                return User.findOneAndUpdate(
                    {username: username},
                    {$addToSet: {
                        savedBooks: {
                            _id: book.id
                        }
                    }}
                )
            }
        },
        removeBook: async function(parent, {username, book}, context) {
            if (context.user) {
                User.findOneAndUpdate(
                    {username: username},
                    { $pull: {savedBooks: {_id: book.bookId}}},
                    {new: true}
                )
            }
        }
    }
}

model.exports = resolvers;