require('dotenv').config
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
const mongoose = require('mongoose')
const Note = require('./models/note')

let notes=[
    {
        id:1,
        content: "HTML is easy",
        date: "2022-05-30T17:30:31.098Z",
        important:true
    },
    {
        id:2,
        content:"Browser can execute only Javascript",
        date: "2022-05-30T18:39:34.091Z",
        important: false
    },
    {
        id:3,
        content: "GET and POST are the most importatn methods of HTTP protocol",
        important: true
    },
    {
        id:4,
        content: "Things have been kinda hard lately",
        important: true
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then((notes) => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = Note.findById(id).then((note) => {
        response.json(note)
    })
})

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter((note) => {
        return (note.id !== id)
    })
    response.status(204).end()
})

const generateID = () => {
    const maxID = notes.length > 0 
    ? Math.max(...notes.map(n => n.id))
    : 0
    return maxID + 1
}

app.post('/api/notes/', (request, response) => {
    
    if(!request.body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: request.body.content,
        important: request.body.important || false,
        date: new Date(),
    })

    note.save().then((savedNote) => {
        response.json(savedNote)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

