const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('notes', {content:1, date:1})
    response.status(200).send(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    if  (username.length <3) {
        return response.status(400).json({
            error: 'validation error',
            field: 'username',
            message: 'username must be at least 3 characters long'
        })
    } else if (name.length <3) {
        return response.status(400).json({
            error: 'validation error',
            field: 'username',
            message: 'username must be at least 3 characters long'
        })
    } else if (password.length <8) {
        return response.status(400).json({
            error: 'validation error',
            field: 'password',
            message: 'password must be at least 8 characters long'
        })
    }
    
    const existingUser =await User.findOne({ username: username })
    if ( existingUser ) {
        return response.status(400).json({
            error: 'username must be unique'
        })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    console.log(passwordHash)

    const newUser = new User({
        name: name,
        username: username,
        passwordHash: passwordHash,
    })

    const savedUser = await newUser.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter
