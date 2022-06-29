const mongoose = require('mongoose')

const listSchema = mongoose.Schema({
	users: [
			{
				_id: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: 'User'	
				},
				name: String
			}
	],
	name: {
		type: String,
		required: [true, 'Please add list name'],
		unique: true
	},
	description: String,
	listItems: [{
		name: String,
		status: Boolean,
		sortorder: Number
	}],
},{
	timestamps: true
})

module.exports = mongoose.model('List', listSchema)