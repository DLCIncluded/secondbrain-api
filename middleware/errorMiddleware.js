//middleware to overwite Express default behavior
const errorHandler = (err,req,res,next) => {
	//if we provide a status code use it, otherwise send a 500 server error
	const statusCode = res.statusCode ? res.statusCode : 500

	res.status(statusCode)
	res.json({
		message: err.message,
		stack: process.env.NODE_ENV === 'production' ? null : err.stack
	})

}

module.exports = {
	errorHandler,
}