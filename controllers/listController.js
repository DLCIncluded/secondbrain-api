const asyncHandler = require('express-async-handler')
const { find } = require('../models/listModel')
const List = require('../models/listModel')
const User = require('../models/userModel')
const mongoose = require('mongoose')

// @desc	Get lists
// @route	GET /api/lists
//access	Private
const getLists = asyncHandler(async (req,res) => {
	console.log('get lists for' + req.user.id)
	const lists = await List.find({
		"users._id": req.user.id
	})
	res.status(200).json(lists) 
})

// @desc	Get lists
// @route	GET /api/lists/:listid
//access	Private
const getSingleList = asyncHandler(async (req,res) => {
	// const lists = await List.findById(req.params.listid)
	console.log(req.user.id)
	const list = await List.findOne({
			_id: req.params.listid,
			"users._id": req.user.id
		})
	res.status(200).json(list) 
})

// @desc	Create list
// @route	POST /api/lists
//access	Private
const createList = asyncHandler(async (req,res) => {
	console.log(req.body)

	if(!req.body.name){
		res.status(400)
		throw new Error('Please add a name')
	}

	const list = await List.create({
		users: {_id: req.user.id, name: req.user.name},
		name: req.body.name,
		description: req.body.description
	})

	res.status(200).json(list)
})

// @desc	Update list - not currently used
// @route	PUT /api/lists/:listid
//access	Private
const updateList = asyncHandler(async (req,res) => {
	const list = await List.findById(req.params.listid)

	if(!list){
		res.status(400)
		throw new Error('List not found')
	}

	const user = await User.findById(req.user.id)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}

	//check to see if user has access to the list:
	const accessList = await List.find({
		_id: req.params.listid,
		"users._id": req.user.id
	})
	// console.log(`found ${accessList.length} that match id and user`)
	if(accessList.length<1) {
		res.status(401)
		throw new Error('Not Authorized')
	}


	List.findByIdAndUpdate(req.params.listid, {name: req.body.name},{new: true}, function(err, docs){
		if(err){
			res.status(401)
			throw new Error('Not Authorized')
		}else{
			// console.log(docs)
			res.status(200).json(docs)
		}
	})

	
})

// @desc	Set list item done
// @route	PUT /api/lists/item/:listid/:id
//access	Private
const setDone = asyncHandler(async (req,res) => {
	const list = await List.findById(req.params.listid)
	if(!list){
		res.status(400)
		throw new Error('List not found')
	}

	const user = await User.findById(req.user.id)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}

	//check to see if user has access to the list:
	const accessList = await List.find({
		_id: req.params.listid,
		"users._id": req.user.id
	})
	// console.log(`found ${accessList.length} that match id and user`)
	if(accessList.length<1) {
		res.status(401)
		throw new Error('Not Authorized')
	}

	const listitem = await List.find({
		_id: req.params.listid,
		"listItems._id": req.params.id
	})
	// console.log(`found ${accessList.length} that match id and user`)
	if(listitem.length<1) {
		res.status(400)
		throw new Error('Not found')
	}

	List.findOneAndUpdate(
		{ _id: req.params.listid, "listItems._id": req.params.id }, 
		{$set: {'listItems.$.status': req.body.status}},
		{new: true}, 
		function(err, docs){
			if(err){
				res.status(401)
				throw new Error(err.message)
			}else{
				// console.log(docs)
				res.status(200).json(docs)
			}
		})

	// res.status(200).json({message: 'testing'})

	
})

// @desc	Add to list 
// @route	POST /api/lists/item/:listid
//access	Private
const addToList = asyncHandler(async (req,res) => {
	const list = await List.findById(req.params.listid)
	// console.log(list)
	if(!list){
		res.status(400)
		throw new Error('List not found')
	}

	const user = await User.findById(req.user.id)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}

	//check to see if user has access to the list:
	const accessList = await List.find({
		_id: req.params.listid,
		"users._id": req.user.id
	})
	// console.log(`found ${accessList.length} that match id and user`)
	if(accessList.length<1) {
		res.status(401)
		throw new Error('Not Authorized')
	}

	if(!req.body.name){
		res.status(400)
		throw new Error('Missing item name')
	}

	var listItem = {
		name: req.body.name,
		status: false
	}

	// const updatedList = await List.findByIdAndUpdate(req.params.id, req.body ,{new: true})
	List.findOneAndUpdate(
		{ _id: req.params.listid }, 
		{ $push: { listItems: listItem  } },
	   function (error, success) {
			 if (error) {
				throw new Error('Something went wrong')
			 } else {
				res.status(200).json({message: 'successfully added list item'})		
			 }
		 });
})

// @desc	Delete list
// @route	DELETE /api/lists/:listid
//access	Private
const deleteList = asyncHandler(async (req,res) => {

	const list = await List.findById(req.params.listid)
	if(!list) {
		res.status(400).json({message: `Nothing to delete`})
	}

	const user = await User.findById(req.user.id)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}

	//check to see if user has access to the list:
	const accessList = await List.find({
		_id: req.params.listid,
		"users._id": req.user.id
	})
	// console.log(`found ${accessList.length} that match id and user`)
	if(accessList.length<1) {
		res.status(401)
		throw new Error('Not Authorized')
	}
	
	await list.remove()
	
	res.status(200).json({message: `Deleted list`})
})

// @desc	Delete item from list
// @route	DELETE /api/lists/item/:listid/:id
//access	Private
const removeFromList = asyncHandler(async (req,res) => {

	const list = await List.findById(req.params.listid)
	if(!list) {
		res.status(400).json({message: `Nothing to delete`})
	}

	const listitem = await List.find({"listItems._id":req.params.id})
	// console.log(listitem)
	if(listitem.length==0) {
		res.status(400)
		throw new Error('Nothing to delete')
	}


	const user = await User.findById(req.user.id)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}
	
	//check to see if user has access to the list:
	const accessList = await List.find({
		_id: req.params.listid,
		"users._id": req.user.id
	})
	// console.log(`found ${accessList.length} that match id and user`)
	if(accessList.length<1) {
		res.status(401)
		throw new Error('Not Authorized')
	}

	List.findOneAndUpdate(
		{ _id: req.params.listid }, 
		{ $pull: { listItems: { _id: req.params.id} } },
	   function (error, success) {
			 if (error) {
				throw new Error('Something went wrong')
			 } else {
				res.status(200).json({message: 'Successfully removed list item.'})		
			 }
		 });
	
	// res.status(200).json({message: `still testing`})
})

// @desc	Remove items that are done from a given list
// @route	PATCH /api/lists/item/:listid/
//access	Private
const removeDoneFromList = asyncHandler(async (req,res) => {

	const list = await List.findById(req.params.listid)
	if(!list) {
		res.status(400).json({message: `Nothing to delete`})
	}

	const user = await User.findById(req.user.id)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}

	//check to see if user has access to the list:
	const accessList = await List.find({
		_id: req.params.listid,
		"users._id": req.user.id
	})
	// console.log(`found ${accessList.length} that match id and user`)
	if(accessList.length<1) {
		res.status(401)
		throw new Error('Not Authorized')
	}
	
	List.findOneAndUpdate(
		{ _id: req.params.listid }, 
		{ $pull: { listItems: { status: true} } },
	   function (error, success) {
			 if (error) {
				throw new Error('Something went wrong')
			 } else {
				res.status(200).json({message: 'successfully removed list items'})		
			 }
		 });
})

// @desc	Share a list
// @route	POST /api/lists/share/:listid/
//access	Private
const shareList = asyncHandler(async (req,res) => {

	const list = await List.findById(req.params.listid)
	if(!list) {
		res.status(400).json({message: `List not found`})
	}

	const user = await User.findById(req.user.id)
	if(!user){
		res.status(401)
		throw new Error('User not found')
	}

	const sharewith = await User.findById(req.body.sharewith)
	if(!sharewith){
		res.status(401)
		throw new Error('User to share with not found')
	}

	//check to see if user has access to the list:
	const accessList = await List.find({
		_id: req.params.listid,
		"users._id": req.user.id
	})

	if(accessList.length==0) {
		res.status(401)
		throw new Error('Not your list')
	}

	const alreadyHasAccess = await List.find({
		_id: req.params.listid,
		users: {
			"users._id": req.body.sharewith
		}
	})


	console.log(`alreadyhas? ${alreadyHasAccess.length}`)

	if(alreadyHasAccess.length>=1) {
		res.status(400)
		throw new Error('User already has access')
	}
	
	console.log('should be okay to share')
	// res.status(200).json({message: `should be okay to share`})
	newid = mongoose.Types.ObjectId(req.body.sharewith)
	console.log(`object: ${newid}`)
	List.findOneAndUpdate(
		{ _id: req.params.listid }, 
		{ $push: { users: {_id: sharewith.id, name: sharewith.name} } },
	   function (error, success) {
			 if (error) {
				throw new Error('Something went wrong')
			 } else {
				res.status(200).json({message: 'successfully shared list'})		
			 }
		 });
})



module.exports = {
	getLists,
	getSingleList,
	createList,
	updateList,
	setDone,
	addToList,
	shareList,
	deleteList,
	removeFromList,
	removeDoneFromList
}