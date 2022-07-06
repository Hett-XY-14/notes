const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Note = require('../models/note')

const { initialNotes } = require('./test_helper')
const helper = require('./test_helper')

beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(initialNotes)

    //--------------------------------------------
    // const noteObjects = initialNotes.map((note) => {
    //     return new Note(note)
    // })
    // const notePromises = noteObjects.map((noteObject) => {
    //     return noteObject.save()
    // })
    // await Promise.all(notePromises)
    //-------------------------------------------
    // let noteObject = new Note(initialNotes[0])
    // await noteObject.save()
    // noteObject = new Note(initialNotes[1])
    // await noteObject.save()
    //-------------------------------------------
})

describe('When there is initially some notes saved', () => {

    // ------------------------------------------------------
    test('notes are returned as json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    // ------------------------------------------------------
    test('all notes are returned', async () => {
        const response = await api.get('/api/notes/')
    
        expect(response.body).toHaveLength(initialNotes.length)
    })
    // ------------------------------------------------------
    test('a specific note is within the returned notes', async() => {
        const response = await api.get('/api/notes')
    
        const contents = response.body.map((note) => {return note.content})
        expect(contents).toContain(
            'Browser can execute only Javascript'
        ) 
    })
    // ------------------------------------------------------
})

describe('viewing a specific note', () => {

    test('succeeds with a valid id', async () => {
        const notesInDB = await helper.notesInDB()
        const noteToView = notesInDB[0]
        const id = noteToView.id
    
        const resultNote = await api
            .get(`/api/notes/${id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    
        const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
    
        expect(resultNote.body).toEqual(processedNoteToView)
    })
    //--------------------------------------------------------
    test('fails with statuscode 404 if note does not exist', async () => {
        const validNonExistingId = await helper.nonExistingId()

        await api.get(`/api/notes/${validNonExistingId}`)
            .expect(404)
    })
    //--------------------------------------------------------
    test('fails with status 400 if id is invalid', async () => {
        const invalidId = '5a3d5da59070081a82a3445'

        await api.get(`/api/notes/${invalidId}`)
            .expect(400)
    })
    //--------------------------------------------------------
})

describe('addition of a new note', () => {

    test('succeeds with valid data', async () => {
        const newNote = {
            content: 'async/await simplifies making async calls',
            important: true,
        }
    
        await api
            .post('/api/notes')
            .send(newNote)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const notesInDB = await helper.notesInDB()
        console.log('---------------------|||')
        console.log(notesInDB)
        const contents = notesInDB.map(note => note.content)
    
        expect(notesInDB).toHaveLength(initialNotes.length + 1)
        expect(contents).toContain(
            'async/await simplifies making async calls'
        )
    })
    // ------------------------------------------------------
    test('fails with status code 400 if data is invalid', async () => {
        const newNote = {
            important: true
        }

        await api.post('/api/notes')
            .send(newNote)
            .expect(400)

        const notesInDB = await helper.notesInDB()
        expect(notesInDB).toHaveLength(helper.initialNotes.length)
    })
    test('a note without content is not added', async () => {
        const note = {
            important: true,
            content: '',
        }
        await api
            .post('/api/notes')
            .send(note)
            .expect(400)
    
        const notesInDB =await helper.notesInDB()
        expect(notesInDB).toHaveLength(initialNotes.length)
    })
    // ------------------------------------------------------    
})

describe('deletion of a note', () => {

    test('succeeds with status code 204 if the id is valid', async() => {
        const notesInDB = await helper.notesInDB()
        const noteToDelete = notesInDB[0]
    
        await api
            .delete(`/api/notes/${noteToDelete.id}`)
            .expect(200)
    
        const notesInDBNow = await helper.notesInDB()
        expect(notesInDBNow).toHaveLength(notesInDB.length-1)
    
        const contents = notesInDBNow.map((note) => { return note.content })
        expect(contents).not.toContain(noteToDelete.content)
    })
    // ------------------------------------------------------
    test('fails with status code 400 bad request if id is invalid', async () => {
        const invalidId = '5a3d5da59070081a82a3445'

        await api.delete(`/api/notes/${invalidId}`)
            .expect(400)
    })
})


afterAll(() => {
    mongoose.connection.close()
})