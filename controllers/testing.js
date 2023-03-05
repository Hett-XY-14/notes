const testingRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

testingRouter.post('/reset', async (request, response) => {
    await Note.deleteMany({ })
    await User.deleteMany({ })
    console.log('Entering the Router')
    response.status(204).end()
})

module.exports = testingRouter