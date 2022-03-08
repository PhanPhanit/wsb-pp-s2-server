require('dotenv').config();
require('express-async-errors');
// express
const express = require('express');
const app = express();
// file upload
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

// passport
const passportSetup = require('./passport/passport');
// const passport = require('passport');

// rest of packages
// const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
// database
const connectDB = require('./db/connect');
// routers
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const checkoutRouter = require('./routes/checkOutRoutes');
const productRouter = require('./routes/productRoutes');
const uploadRouter = require('./routes/uploadRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderItemRouter = require('./routes/orderItemRoutes');
const orderRouter = require('./routes/orderRoutes');
const slideRouter = require('./routes/slideRoutes');
const cookieRouter = require('./routes/cookieRoutes');
// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
// route
// app.use(passport.initialize());
app.use(express.static('./public'));
app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload({useTempFiles: true}));
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/wsb-cate', categoryRouter);
app.use('/api/v1/wsb-ch-out', checkoutRouter);
app.use('/api/v1/wsb-pro', productRouter);
app.use('/api/v1/wsb-upload', uploadRouter);
app.use('/api/v1/wsb-rev', reviewRouter);
app.use('/api/v1/wsb-od-item', orderItemRouter);
app.use('/api/v1/wsb-od', orderRouter);
app.use('/api/v1/wsb-slide', slideRouter);
app.use('/api/v1/wsb-res-cookie', cookieRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL);
        app.listen(port, console.log(`Server is listening on port ${port}`));
    } catch (error) {
        console.log(error);
    }
}
start();