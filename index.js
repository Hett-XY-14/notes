const express = require('express')
const app = express()
app.use(express.json())

app.use(express.static('build'))

const cors = require('cors')
app.use(cors())

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
    response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find((note) => {
        return (note.id === id)
    })
    if(note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
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

    const note = {
        content: request.body.content,
        important: request.body.important || false,
        date: new Date(),
        id: generateID(),
    }

    notes = notes.concat(note)
    response.json(note)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

