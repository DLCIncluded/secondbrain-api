const express = require('express')
const router = express.Router()
const {getLists,updateList,deleteList,createList,addToList,removeFromList, removeDoneFromList, shareList, getSingleList, setDone} = require('../controllers/listController')
const {protect} = require('../middleware/authMiddleware')

router.get('/', protect, getLists)

router.post('/', protect, createList)
router.post('/item/:listid', protect, addToList)
router.post('/share/:listid', protect, shareList)

router.put('/:listid', protect, updateList)
router.get('/:listid', protect, getSingleList) 
router.put('/item/:listid/:id', protect, setDone)

router.delete('/:listid', protect, deleteList)
router.delete('/item/:listid/:id', protect, removeFromList)

router.patch('/item/:listid', protect, removeDoneFromList)


module.exports = router