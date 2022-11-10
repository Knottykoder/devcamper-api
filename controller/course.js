const ErrorResponse = require('../utlis/errorResonse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')
const BootCamp = require('../models/BootCamp')


exports.getCourses = asyncHandler(async (req,res,next)=>{

    if(req.params.bootcampId){
        const course = await Course.find({bootcamp:req.params.bootcampId})

        res.status(200).json({
            success: true,
            count:course.length,
            data:course
        })
    }else{
        res.status(200).json(res.advanceResults)
       
    }
})

exports.getCourse = asyncHandler(async (req,res,next)=>{
   
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if(!course){
        return next(new ErrorResponse(`No course with id of ${req.params.id}`,404))
    }

    res.status(200).json({
        success: true,
        data: course
    })
})

exports.addCourse = asyncHandler(async (req,res,next)=>{
   req.body.bootcamp = req.params.bootcampId

    const bootcamp = await BootCamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`,404))
    }


    if(bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401))

    }

    const course = await Course.create(req.body)

    res.status(200).json({
        success: true,
        data: course
    })
})

exports.updateCourse = asyncHandler(async (req,res,next)=>{
   

    let course = await Course.findById(req.params.id)

    if(!course){
        return next(new ErrorResponse(`No course with id of ${req.params.id}`,404))
    }

    if(course.user.toString() !== req.user.id && req.user.role !=='admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update course to bootcamp ${course._id}`, 401))

    }


     course = await Course.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators: true
     })

    res.status(200).json({
        success: true,
        data: course
    })
})

exports.deleteCourse = asyncHandler(async (req,res,next)=>{
   
   const course = await Course.findByIdAndDelete(req.params.id)

    if(!course){
        return next(new ErrorResponse(`No course with id of ${req.params.id}`,404))
    }

    if(course.user.toString() !== req.user.id && req.user.role !=='admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete course to bootcamp ${course._id}`, 401))

    }

    res.status(200).json({
        success: true,
        data: {}
    })
})