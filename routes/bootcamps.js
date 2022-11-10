const express = require('express')
const router = express.Router()
const { getBootcamp, getBootcamps, updateBootcamp, deleteBootcamp, createBootcamp, getBootcampInRadius, bootcampPhotoUpload } = require('../controller/bootcamps')
const BootCamp = require('../models/BootCamp')
const advanceResult = require('../middleware/advanceResult')
const courseRouter = require('./course')
const reviewRouter = require('./review')
const { protect, authorize } = require('../middleware/auth')

router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)

router.route('/').get(advanceResult(BootCamp, 'courses'), getBootcamps).post(protect, authorize('publisher','admin'),createBootcamp)
router.route('/:id').get(getBootcamp).put(protect, authorize('publisher', 'admin'), updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp)
router.route('/radius/:zipcode/:distance').get(getBootcampInRadius)
router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)
module.exports = router