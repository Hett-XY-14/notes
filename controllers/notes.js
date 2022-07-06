const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({}).populate('user', {username: 1})
    response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
    const id = request.params.id
    const note = await Note.findById(id).populate('user', {username: 1})
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

notesRouter.delete('/:id', async (request, response) => {
    const id = request.params.id
    await Note.findByIdAndDelete(id)
    response.status(200).end()
})

notesRouter.put('/:id', async (request, response) => {
    const id = request.params.id
    const {content, important} = request.body
    const note = {
        content : content,
        important : important
    }

    const updatedNote = await Note.findByIdAndUpdate(id, note, {new:true, runValidators:true, context:'query'})
    response.json(updatedNote)
})

notesRouter.post('/', async (request, response) => {
    const body = request.body
    const user = await User.findById(body.userId)

    const note = new Note({
        content: request.body.content,
        important: request.body.important || false,
        date: new Date(),
        user: user._id
    })
    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()
    response.status(201).json(savedNote)
})

module.exports = notesRouter