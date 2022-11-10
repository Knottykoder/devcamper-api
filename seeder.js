const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({path: './config/config.env'})

const BootCamp = require('./models/BootCamp')
const Course = require('./models/Course')
const Users = require('./models/Users')
const Review = require('./models/Review')

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser : true,
 })
 
 const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/data/bootcamps.json`, 'utf-8'))
 const courses = JSON.parse(fs.readFileSync(`${__dirname}/data/courses.json`, 'utf-8'))
 const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`,'utf-8'))
 const reviews = JSON.parse(fs.readFileSync(`${__dirname}/data/reviews.json`,'utf-8'))

 const importData = async()=>{
     try {
        await BootCamp.create(bootcamps)
        await Course.create(courses)
        await Users.create(users)
        await Review.create(reviews)
        console.log('Data');
        process.exit()
     } catch (error) {
        console.log(error);
     } }

 const deleteData = async()=>{
     try {
        await BootCamp.deleteMany()
        await Course.deleteMany()
        await Users.deleteMany()
        await Review.deleteMany()
        console.log('Delete');
        process.exit()
     } catch (error) {
        console.log(error);
     } }

if(process.argv[2] === '-i'){
    importData()
}else if(process.argv[2] === '-d'){
    deleteData()
}
