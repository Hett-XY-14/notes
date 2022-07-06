const jwt = require('jsonwebtoken')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()

loginRouter.post('/', async (request, response) => {
    const {username, password} = request.body

    const existingUser = await User.findOne({ username })
    console.log(existingUser)
    console.log(password)
    const passwordCorrect = existingUser === null ? 
        false : await bcrypt.compare(password, existingUser.passwordHash)

    if (!(existingUser && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        username: existingUser.username,
        id: existingUser._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET)

    response.status(200).send({
        token: token,
        username: existingUser.username,
        name: existingUser.name,
    })
})

module.exports = loginRouter