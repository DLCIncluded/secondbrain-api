const asyncHandler = require('express-async-handler')
const Goal = require('../models/goalModel')
const User = require('../models/userModel')

// @desc	Get goals
// @route	GET /api/goals
//access	Private
const getGoals = asyncHandler(async (req,res) => {
	const goals = await Goal.find({user: req.user.id})

	res.status(200).json(goals) 
})

// @desc	Create goal
// @route	POST /api/goals
//access	Private
const createGoal = asyncHandler(async (req,res) => {
	console.log(req.body)
	if(!req.body.text){
		res.status(400)
		throw new Error('Please add a text field')
	}

	const goal = await Goal.create({
		user: req.user.id,
		text: req.body.text,
	})

	res.status(200).json(goal)
})

// @desc	Update goal
// @route	PUT /api/goals/:id
//access	Private
const updateGoal = asyncHandler(async (req,res) => {
	const goal = await Goal.findById(req.params.id)

	if(!goal){
		res.status(400)
		throw new Error('Goal not found')
	}

	const user = await User.findById(req.user.id)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}

	//make sure the logged in user matches the goal user
	if(goal.user.toString() != user.id){
		res.status(401)
		throw new Error('Not authorized')
	}

	const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body ,{new: true})

	res.status(200).json(updatedGoal)
})

// @desc	Delete goal
// @route	DELETE /api/goals/:id
//access	Private
const deleteGoal = asyncHandler(async (req,res) => {

	const goal = await Goal.findById(req.params.id)
	if(!goal) {
		res.status(400).json({message: `Nothing to delete`})
	}

	const user = await User.findById(req.user.id)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}

	//make sure the logged in user matches the goal user
	if(goal.user.toString() != user.id){
		res.status(401)
		throw new Error('Not authorized')
	}
	
	await goal.remove()
	
	res.status(200).json({message: `Deleted goal`})
})


module.exports = {
	getGoals,
	createGoal,
	updateGoal,
	deleteGoal
}