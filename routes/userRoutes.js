const express = require('express')
const router = express.Router()
const {registerUser, loginUser, getMe, requestFriend, acceptFriend, removeFriend, checkUser, getRequests, rejectRequest, searchUser, getSentRequests} = require('../controllers/userController')

const {protect} = require('../middleware/authMiddleware')

router.post('/', registerUser)
router.post('/login', loginUser)
router.post('/request/:userid', protect, requestFriend)
router.post('/search', protect, searchUser)
router.put('/request/:userid', protect, acceptFriend)
router.get('/request', protect, getRequests)
router.get('/request/sent', protect, getSentRequests)
router.delete('/request/:userid', protect, rejectRequest)
router.delete('/friend/:userid', protect, removeFriend)
router.get('/me', protect, getMe)
router.get('/check', protect, checkUser)


module.exports = router