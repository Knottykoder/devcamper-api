const express = require('express')
const {getCourses,getCourse, addCourse, updateCourse, deleteCourse} = require('../controller/course')
const router = express.Router({mergeParams:true})
const course = require('../models/Course')
const advanceResult = require('../middleware/advanceResult')
const {protect,authorize} = require('../middleware/auth')


router.route('/').get(advanceResult(course, {
    path: 'bootcamp',
    select: 'name description'
}), getCourses).post(protect,authorize('publisher','admin'),addCourse)
router.route('/:id').get(getCourse).put(protect,authorize('publisher','admin'),updateCourse).delete(protect,authorize('publisher','admin'),deleteCourse)

module.exports = router