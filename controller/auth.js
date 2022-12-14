const ErrorResponse = require('../utlis/errorResonse')
const asyncHandler = require('../middleware/async')
const User = require('../models/Users')
const sendEmail = require('../utlis/sendEmail')
const crypto = require('crypto')

exports.register = asyncHandler(async(req,res,next)=>{
    const {name,email,password,role} = req.body

    const Users = await User.create({
        name,email,password,role
    })
    const token = Users.getSignedJwtToken()

    res.status(200).json({ success:true,token})
})

exports.login = asyncHandler(async(req,res,next)=>{
    const {email,password} = req.body
    if(!email || !password){
        return next(new ErrorResponse('Please provide email and password',400))
    }

    const users = await User.findOne({email}).select('+password')
    if(!users){
        return next(new ErrorResponse('invalid credentials',401))

    }

    const isMatch = await users.matchPassword(password)
   
    if(!isMatch){
        return next(new ErrorResponse('invalid credentials',401))

    }

    
     sendTokenResponse(users,200,res)
})



exports.getme = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        data: user
    })
})

exports.forgotPassword = asyncHandler(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email})
     
    if(!user){
        return next(new ErrorResponse('There is no user with this email',404))
    }

    const resetToken = await user.getResetPasswordToken()

    await user.save({ValiditeBeforeSave:false})

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })
        res.status(200).json({sucess : true,data:'Email sent successfully'})

    } catch (error) {
        
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({validateBeforeSave:false})

        return next(new ErrorResponse('Email could not be sent',500))
    }

    res.status(200).json({
        success: true,
        data: user
    })
})

exports.resetPassword = asyncHandler(async(req,res,next)=>{
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt: Date.now()}
    })

    if(!user){
        return next(new ErrorResponse('invalid Token',400))
    }

    user.password = req.body.password
    user.resetPasswordToken =undefined
    user.resetPasswordExpire= undefined

    await user.save()

    sendTokenResponse(user,200,res)
    })


    exports.updateDetails = asyncHandler(async(req,res,next)=>{

        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        }
        const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
            new:true,
            runValidators:true
        })

        res.status(200).json({
            success: true,
            data: user
        })
    })

exports.updatePassword = asyncHandler(async(req,res,next)=>{



    const user = await User.findById(req.user.id).select('+password')

    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Password is incorrect',401))
    }

    user.password = req.body.newPassword
    await user.save()
  
    sendTokenResponse(user,200,res)
})

exports.logout = asyncHandler(async(req,res,next)=>{
    res.cookie('token','none',{
        expires:new Date(Date.now()+10*1000),
        httpOnly:true
    })
    res.status(200).json({
        success: true,
        data: {}
    })
})


const sendTokenResponse = (users,statusCode,res)=>{
    const token = users.getSignedJwtToken()
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24*60*60*1000),
        httpOnly: true
    }

    res.status(statusCode).cookie('token',token,options).json({
        sucess:true,token
    })
}