const express = require('express')
const router = express.Router()
const db = require('../../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authLockedRoute = require('./authLockedRoute')


// GET /users - test endpoint
router.get('/', (req, res) => {
	res.json({ msg: 'welcome to the users endpoint' })
})

// POST /users/register - CREATE new user
router.post('/register', async (req, res) => {
	try {
		// check if user exists already
		const findUser = await db.User.findOne({
			email: req.body.email
		})

		// don't allow emails to register twice
		if (findUser) {
			return res.status(400).json({ msg: 'email exists already' })
		}

		// hash password
		const password = req.body.password
		const saltRounds = 12
		const hashedPassword = await bcrypt.hash(password, saltRounds)

		// create new user
		const newUser = new db.User({
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword
		})

		await newUser.save()

		// create jwt payload
		const payload = {
			name: newUser.name,
			email: newUser.email,
			_id: newUser.id
		}

		// sign jwt and send back
		const token = jwt.sign(payload, process.env.JWT_SECRET)

		res.json({ token })
	} catch (error) {
		console.log(error)
		res.status(500).json({ msg: 'server error' })
	}
})

// POST /users/login -- validate login credentials
router.post('/login', async (req, res) => {
	try {
		// try to find user in the db
		const foundUser = await db.User.findOne({
			email: req.body.email
		})

		const noLoginMessage = 'Incorrect username or password'

		// if the user is not found in the db, return and sent a status of 400 with a message
		if (!foundUser) {
			return res.status(400).json({ msg: noLoginMessage })
		}

		// check the password from the req body against the password in the database
		const matchPasswords = bcrypt.compare(req.body.password, foundUser.password)

		// if provided password does not match, return an send a status of 400 with a message
		if (!matchPasswords) {
			return res.status(400).json({ msg: noLoginMessage })
		}

		// create jwt payload
		const payload = {
			name: foundUser.name,
			email: foundUser.email,
			_id: foundUser.id
		}

		// sign jwt and send back
		const token = jwt.sign(payload, process.env.JWT_SECRET)

		res.json({ token })
	} catch (error) {
		console.log(error)
		res.status(500).json({ msg: 'server error' })
	}
})


// GET /auth-locked - will redirect if bad jwt token is found
router.get('/auth-locked', authLockedRoute, (req, res) => {
	// use res.locals.user here to do authorization stuff
	console.log('logged in user:', res.locals.user)
	res.json({ msg: 'welcome to the private route!' })
})

// GET /favorites -- array of selected favorite movies 
router.get('/favorites', async (req,res) => {
    try{
        const findUser= await db.User.find({_id: "6452cbf785d57e0fa68d23f7"})
		const favorites= findUser.favoriteMovies.find({_id: '6452cbf785d57e0fa68d23f8'})
        res.json({result: favorites})
    }catch(err){
        console.log(err)
    }
})


//POST /favorites -- add a movie to the favorites array
router.post('/favorites', async (req,res)=>{
    try{
        //const newFave= await db.User.create(req.body)
		const findUser= await db.User.find({_id: "6452d66a391cd338fac7a4b0"})
		const addFave= findUser.results.favorites.push('_testId')
        res.json({result: findUser})
    }catch(err){
        console.log(err)
    }
})

//DELETE /favorites -- delete a movie from the array
router.delete('/favorites', async (req,res) => {
    try{
		
        const deletedFavorite = await db.User.findOneAndDelete({favoriteMovies: {title: 'Test'},})
        res.json({result: "deletedFavorite"})
    }catch(err){
        console.log(err)
    }
})
module.exports = router
