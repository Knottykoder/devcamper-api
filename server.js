// module inports
const path = require('path')
const express = require('express');
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet")
const xss = require('xss-clean')
const hpp = require('hpp');
const rateLimit = require('express-rate-limit')
const cors = require('cors')
//dot-env
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

//file/function-import
const connectDB = require('./config/db')
const errorhandler = require('./middleware/error')
const course = require('./routes/course')
const bootcamps = require('./routes/bootcamps')
const auth = require('./routes/auth')
const users = require('./routes/users') 
const reviews = require('./routes/review') 



connectDB()


const app = express()

app.use(cookieParser())

app.use(express.json())

// const logger = (req,res,next) =>{
//     req.hello = 'hello world'
//   console.log('Middleware running');
//   next()
// }

app.use(morgan('dev'))

app.use(fileUpload())

app.use(mongoSanitize())

app.use(helmet())

app.use(xss())

app.use(hpp())

const limit = rateLimit({
    windowMs: 10 * 60 * 1000,
	max: 5,
})

app.use(limit)

app.use(cors())

app.use(express.static(path.join(__dirname,'public')))

app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', course)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)

app.use(errorhandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT} `));

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Err: ${err.message}`);
    server.close(()=> process.exit(1))
})