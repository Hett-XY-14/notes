require('dotenv').config
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Note = require('./models/note')
const { response, query } = require('express')
const note = require('./models/note')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())


app.get('/api/notes', (request, response) => {
    Note.find({}).then((notes) => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    const id = request.params.id
    Note.findById(id)
    .then((note) => {
        if (note) {
            response.json(note)
        } else {
            console.log('error 404, Not found')
            response.status(404).end()
        }
    })
    .catch((error) => {
        next(error)
    })
})

app.delete('/api/notes/:id', (request, response, next) => {
    const id = request.params.id
    Note.findByIdAndDelete(id)
    .then((result) => {
        response.status(200).end()
    })
    .catch((error) => {
        next(error)
    })
})

app.put('/api/notes/:id', (request, response, next) => {
    const id = request.params.id
    const {content, important} = request.body
    const note = {
        content : content,
        important : important
    }

    Note.findByIdAndUpdate(id, note, {new : true, runValidators: true, context: 'query'})
    .then((updatedNote) => {
        response.json(updatedNote)
    })
    .catch((error) => {
        next(error)
    })

})

const generateID = () => {
    const maxID = notes.length > 0 
    ? Math.max(...notes.map(n => n.id))
    : 0
    return maxID + 1
}


app.post('/api/notes/', (request, response, next) => {

    const note = new Note({
        content: request.body.content,
        important: request.body.important || false,
        date: new Date(),
    })

    note.save().then((savedNote) => {
        response.json(savedNote)
    })
    .catch((error) => {
        next(error)
    })
})

const unknownEndPoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndPoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({
            error: 'malformatted id'
        })
    } else if (error.name === "ValidationError") {
        return response.status(400).send({error: error.message})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

