const mongoose = require('mongoose')

const requestSchema = mongoose.Schema({
	requester: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	},
	requestee: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	}
},{
	timestamps: true
})

module.exports = mongoose.model('Request', requestSchema)