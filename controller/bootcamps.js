const path = require('path')
const ErrorResponse = require('../utlis/errorResonse')
const asyncHandler = require('../middleware/async')
const BootCamp = require('../models/BootCamp')
const geocoder = require('../utlis/geocoder')

exports.getBootcamps = asyncHandler(async (req,res,next) =>{
     res.status(200).json(res.advanceResults)
    } 
    
)

exports.getBootcamp = asyncHandler( async (req,res,next) =>{
   
        const bootcamp = await BootCamp.findById(req.params.id)

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)) 
        }

        res.status(200).json({sucess:true,data:bootcamp})
    })


exports.createBootcamp = asyncHandler(async (req,res,next) =>{
    req.body.user = req.user.id

    const publishedBootcamp = await BootCamp.findOne({user:req.user.id})
    if(publishedBootcamp && req.user.role !=='admin'){
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp `,400))
    }
    
        const bootcamp = await BootCamp.create(req.body)

        res.status(201).json({
            sucess: true,
            data:bootcamp,
        })
    } 
)

exports.updateBootcamp = asyncHandler(async (req,res,next) =>{
   
        let bootcamp = await BootCamp.findById(req.params.id)
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }
        
        if(bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
            return next(new ErrorResponse(`User ${req.params.id} is not authorized to update`, 401))

        }

        bootcamp = await BootCamp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })

        res.status(200).json({sucess:true,data:bootcamp})
    } )

exports.deleteBootcamp = asyncHandler(async (req,res,next) =>{
   
        const bootcamp = await BootCamp.findById(req.params.id)

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }

        if(bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
            return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete`, 401))

        }
        bootcamp.remove()
        res.status(200).json({sucess:true,data:bootcamp})
    } )

    exports.getBootcampInRadius = asyncHandler(async (req,res,next) =>{

        const {zipcode, distance} = req.params
   
        console.log('geo api request - ', process.env.GEOCODER_API_KEY);
        const loc = await geocoder.geocode(zipcode)
        const lat = loc[0].latitude
        const lan = loc[0].longitude
        
        const radius = distance / 3963

        const bootcamps = await BootCamp.find({
            location: {$geoWithin: {$centerSphere:[[lan,lat],radius] }}
        })
        res.status(200).json({
            sucess: true,
            count: bootcamps.length,
            data: bootcamps
        })
    } )

    exports.bootcampPhotoUpload = asyncHandler(async(req,res,next)=>{
        const bootcamp = await BootCamp.findById(req.params.id)

       
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }

        if(bootcamp.user.toString() !== req.user.id && req.user.role !=='admin'){
            return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete`, 401))

        }
        
        if(!req.files){
            return next(new ErrorResponse(`Please upload a file`, 400))
        }
       

        const file = req.files.file

        if(!file.mimetype.startsWith('image')){
            return next(new ErrorResponse(`Please upload a image file`, 400))
        }

        if(file.size > process.env.MAX_FILE_UPLOAD){
            return next(new ErrorResponse(`Please upload a image file less than ${process.env.MAX_FILE_UPLOAD}`, 400))
        }

        file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async error =>{
            if(error){
                console.error(error)
                return next(new ErrorResponse('Problem with file upload',500))
            }
            await BootCamp.findByIdAndUpdate(req.params.id,{
                photo: file.name
            })
            res.status(200).json({
                success: true,
                data: file.name
            })
        })
    })