const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
	username: {
		type: String,
		required: [true, 'Please add a username']
	},
	email: {
		type: String,
		required: [true, 'Please add your email'],
		unique: true
	},
	password: {
		type: String,
		required: [true, 'Please add your name']
	},
	friends: [{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		username: String
	}],
	admin: {
		type: Boolean,
		default:false
	}
},{
	timestamps: true
})

module.exports = mongoose.model('User', userSchema)