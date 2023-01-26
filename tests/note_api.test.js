const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Note = require('../models/note')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const { initialNotes } = require('./test_helper')
const helper = require('./test_helper')

// ------------------ Users ---------------------- //

describe('when there is initially one user in the db', () => {

    beforeEach(async () => {
        await User.deleteMany({})

        const saltRounds = 10
        const passwordHash = await bcrypt.hash('genericPassword', saltRounds)
        console.log(passwordHash)
        const newUser = new User({
            username: 'genericUsername',
            name: 'genericName',
            passwordHash: passwordHash
        })
        await newUser.save()
    })
    //----------------------------------------------------
    test('creation succeeds with a new username', async () => {
        const newUser = {
            username: 'newGenericUsername',
            name: 'newGenericName',
            password: 'newGenericPassword'
        }

        await api.post('/api/users/')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersInDB = await helper.usersInDB()
        const usernamesInDB = usersInDB.map((user) => {
            return ( user.username )
        })
        expect(usersInDB).toHaveLength(2)
        expect(usernamesInDB).toContain(newUser.username)
    })
    //----------------------------------------------------
    test('creation fails with a proper statuscode and error message if username is already taken', async () => {
        const usersInDB = await helper.usersInDB()
        const existingUser = usersInDB[0]

        const newUser = {
            username: existingUser.username,
            name: 'Peter Ferguson',
            password: 'HighlySecurePasswordXD'
        }

        const result = await api.post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(result.body.error).toContain('username must be unique')

        const usersInDBAfter = await helper.usersInDB()
        expect(usersInDB).toEqual(usersInDBAfter)
    })
    //----------------------------------------------------
    test('login succeeds with the correct password for an existing user', async () => {
        const userCredentials = {
            username: 'genericUsername',
            password: 'genericPassword'
        }

        const result = await api.post('/api/login')
            .send(userCredentials)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        console.log(result)
    })
    //----------------------------------------------------
})
 

// ------------------ Notes ---------------------- //

beforeEach(async () => { 
    await Note.deleteMany({})
    await Note.insertMany(initialNotes)
    
    // Alternative code
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
        const users = await helper.usersInDB()
        const userId = users[0].id
        const newNote = {
            content: 'async/await simplifies making async calls',
            important: true,
            userId: userId
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
    //-------------------------------------------------------
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