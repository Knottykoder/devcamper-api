const express = require('express')
const { getUsers, createUser, updateUser, deleteUser, getUser } = require('../controller/users')
const router = express.Router({mergeParams:true})
const Users = require('../models/Users')
const advanceResult = require('../middleware/advanceResult')
const {protect,authorize} = require('../middleware/auth')

router.use(protect);
router.use(authorize('admin'));


router.route('/').get(advanceResult(Users),getUsers).post(createUser)
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser)

module.exports = router