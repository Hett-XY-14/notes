const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const helpers = require('./test_helper')

const api = supertest(app)

describe('when there is initially one user in the db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const saltRounds = 10
        const passwordHash = await bcrypt.hash('genericPassword', saltRounds)

        const newUser = new User({
            username: 'genericUsername',
            name: 'genericName',
            password: passwordHash
        })
        await newUser.save()
    })
    
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

        const usersInDB = await helpers.usersInDB()
        const usernamesInDB = usersInDB.map((user) => {
            return ( user.username )
        })
        expect(usersInDB).toHaveLength(2)
        expect(usernamesInDB).toContain(newUser.username)
    })

    test('creation fails with a proper statuscode and error message if username is already taken', async () => {
        const usersInDB = await helpers.usersInDB()
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

        const usersInDBAfter = await helpers.usersInDB()
        expect(usersInDB).toEqual(usersInDBAfter)
    })

    test.only('login succeeds with the correct password for an existing user', async () => {
        const userCredentials = {
            username: 'genericUsername',
            password: 'genericPassword'
        }

        const result = await api.post('/api/login')
            .send(userCredentials)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(result).toContain('token')
    })
})