const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const Request = require('../models/requestsModel')

// @desc	Register User
// @route	POST /api/users
//access	Public
const registerUser = asyncHandler(async (req,res) => {
	const {username, email, password} = req.body
	//make sure they sent all required fields
	if(!username || !email || !password){
		res.status(400)
		throw new Error("Please fill out all fields")
	}

	//check if user exists
	const userExists = await User.findOne({username})
	if(userExists){
		res.status(400)
		throw new Error("User already registered with that username.")
	}

	const emailExists = await User.findOne({email})
	if(emailExists){
		res.status(400)
		throw new Error("User already registered with that email.")
	}

	//hash password
	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(password, salt)

	//Create user in db
	const user = await User.create({
		username,
		email,
		password: hashedPassword,
	})

	if (user) {
		res.status(201).json({
			_id: user.id,
			username: user.username,
			email: user.email,
			isadmin: false,
			token: generateToken(user._id)
		})
	}else{
		res.status(400)
		throw new Error("Invalid data provided")
	}
})

// @desc	Authenticate User
// @route	POST /api/users/login
//access	Public
const loginUser = asyncHandler(async (req,res) => {
	const {username, password} = req.body
	
	//check for user with given user ( this should find either username or email )
	const user = await User.findOne({
		$or: [
			{username: username},
			{email: username}
		]	
	})


	//make sure user exists and compare the pw they provided
	if(user && (await bcrypt.compare(password,user.password))){
		res.status(201).json({
			_id: user.id,
			username: user.username,
			email: user.email,
			token: generateToken(user._id),
			isadmin: user.admin
		})
	}else{
		res.status(400)
		throw new Error("Invalid credentials")
	}

})


// @desc	Authenticate User
// @route	GET /api/users/me
//access	Private
const getMe = asyncHandler(async (req,res) => {
	res.json(req.user)
})

// @desc	Verify Admin User
// @route	GET /api/users/check
//access	Private
const checkUser = asyncHandler(async (req,res) => {
	console.log(req.user)
	if(!req.user.admin){
		res.status(401)
		throw new Error('Not Authorized')
	}
	res.status(200).json({
		message:"user is admin"
	})
})

// @desc	Send friend request
// @route	POST /api/users/request/:userid
//access	Private
const requestFriend = asyncHandler(async (req,res) => {
	const user = await User.findById(req.params.userid)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}
	//check to see if users are already friends
	const friends = await User.find({
		_id: req.user.id,
		"friends._id": req.params.userid
	})
	// console.log(`found ${friends.length} that match id and user`)
	if(friends.length>1) {
		res.status(401)
		throw new Error('Already friends')
	}
	if(req.user.id == req.params.userid){
		res.status(400)
		throw new Error('Cannot be friends with yourself')
	}
	//check to see if there is already a request sent
	const oldrequest = await Request.find({
		$or: [
			{
				$and: [
					{ "requester._id": req.user.id },
					{ "requestee._id": req.params.userid },
				]
			},
			{
				$and: [
					{ "requester._id": req.params.userid },
					{ "requestee._id": req.user.id },
				]
			}
		]})
	if(oldrequest.length>=1) {
		res.status(401)
		throw new Error('Friend request already exists')
	}
	const request = await Request.create({
		requester: {
			_id: req.user.id,
			username: req.user.username
		},
		requestee: {
			_id: user.id,
			username: user.username
		}
	})
	// console.log(request)
	if (request) {
		res.status(201).json({
			message:"sent friend request"
		})
	}else{
		res.status(400)
		throw new Error("Invalid data provided")
	}
})

// @desc	Accept friend request
// @route	PUT /api/users/request/:userid
//access	Private
const acceptFriend = asyncHandler(async (req,res) => {
	const user = await User.findById(req.params.userid)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}
	//check to see if users are already friends
	const friends = await User.find({
		_id: req.user.id,
		"friends._id": req.params.userid
	})
	console.log(`found ${friends.length} that match id and user`)
	if(friends.length>1) {
		res.status(401)
		throw new Error('Already friends')
	}
	//find requests someone has sent the user who is logged in
	const requestToAccept = await Request.find({
		$and: [
			{ "requester._id": req.params.userid },
			{ "requestee._id": req.user.id },
		]
	})
	// console.log(requestToAccept[0]._id)
	if(requestToAccept.length==0) {
		res.status(400)
		throw new Error('Request does not exist')
	}
	var requester = {
		_id: req.user.id,
		username: req.user.username
	}
	var requestee= {
		_id: user.id,
		username: user.username
	}
	const user1 = await User.findOneAndUpdate(
		{ _id: user.id }, 
		{ $push: { friends: requester  } });
	const user2 = await User.findOneAndUpdate(
		{ _id: req.user.id }, 
		{ $push: { friends: requestee  } });
		
	var requestToDel = Request.findById(requestToAccept[0]._id)
	if (user1 && user2) {
		await requestToDel.remove()
		res.status(201).json({
			message:"accepted friend request"
		})
	}else{
		res.status(400)
		throw new Error("Invalid data provided")
	}
})

// @desc	Reject friend request
// @route	DELETE /api/users/request/:userid
//access	Private
const rejectRequest = asyncHandler(async (req,res) => {
	const user = await User.findById(req.params.userid)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}

	//find requests someone has sent the user who is logged in
	const requestToAccept = await Request.find({
		$or: [{
			$and: [
				{ "requester._id": req.params.userid },
				{ "requestee._id": req.user.id },
			],
			$and: [
				{ "requester._id": req.user.id },
				{ "requestee._id": req.params.userid },
			]
		}]
	})		
	// console.log(requestToAccept[0]._id)
	if(requestToAccept.length==0) {
		res.status(400)
		throw new Error('Request does not exist')
	}

	var requestToDel = Request.findById(requestToAccept[0]._id)

	await requestToDel.remove()
	res.status(200).json({
		message:"rejected friend request"
	})
	// res.json({message: 'something'})
})

// @desc	List friend requests
// @route	GET /api/users/request/
//access	Private
const getRequests = asyncHandler(async (req,res) => {
	const requests = await Request.find(
		{ "requestee._id": req.user.id },
	)
	if(requests.length==0){
		res.status(200).json({message: 'No requests', count: 0})
	}else{
		res.status(200).json({requests: requests, count: requests.length})
	}
})

// @desc	List sent requests
// @route	GET /api/users/request/sent
//access	Private
const getSentRequests = asyncHandler(async (req,res) => {
	const requests = await Request.find(
		{ "requester._id": req.user.id },
	)
	if(requests.length==0){
		res.status(200).json({message: 'No requests', count: 0})
	}else{
		res.status(200).json({requests: requests, count: requests.length})
	}
})

// @desc	Search for a user
// @route	POST /api/users/search/
//access	Private
const searchUser = asyncHandler(async (req,res) => {
	const {username} = req.body
	// console.log(`Searching for username: ${username}`)
	const user = await User.find({
		$or: [
			{username: username},
			{email: username}
		]	
	}).select('id username createdAt')

	if(user.length==0){
		res.status(200).json({message: 'No user found', count: 0})
	}else{
		res.status(200).json({users: user, count: user.length})
	}
})


// @desc	remove friend
// @route	DELETE /api/users/friend/:userid
//access	Private
const removeFriend = asyncHandler(async (req,res) => {
	const user = await User.findById(req.params.userid)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}
	const user1 = await User.findOneAndUpdate(
		{ _id: user.id }, 
		// { $pull: { 'friends._id': req.user.id } }
		{ $pull: { friends: { _id: req.user.id } } }
		);


	const user2 = await User.findOneAndUpdate(
		{ _id: req.user.id }, 
		// { $pull: { 'friends._id': user.id  } }
		{ $pull: { friends: { _id: user.id } } }
		);
		

	if (user1 && user2) {
		res.status(201).json({
			message:"removed friend"
		})
	}else{
		res.status(400)
		throw new Error("Invalid data provided")
	}

	// res.json({message: 'something'})
})

//generate JWT 
const generateToken = (id) => {
	return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '30d'})
}

module.exports = {
	registerUser,
	loginUser,
	getMe,
	checkUser,
	requestFriend,
	getRequests,
	getSentRequests,
	acceptFriend,
	rejectRequest,
	removeFriend,
	searchUser
}