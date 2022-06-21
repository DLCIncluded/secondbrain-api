const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const cors = require('cors')
const {errorHandler} = require('./middleware/errorMiddleware')
const connectDB = require('./config/db')
const port = process.env.PORT || 5000


connectDB()

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())

app.use('/goals', require('./routes/goalRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/lists', require('./routes/listRoutes'))

app.use(errorHandler)

app.listen(port, () => console.log(`server started on port ${port}`))