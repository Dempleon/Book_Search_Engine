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
        }
    }
}

model.exports = resolvers;