import express from 'express'
import authRoutes from './routes/authRoutes.js'
import dotenv from 'dotenv'
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/messageRoutes.js'
import cors from 'cors'
import { app , server  } from './lib/socket.js';
import path from 'path';
import bodyParser from 'body-parser';


dotenv.config();
const PORT = process.env.PORT
const __dirname = path.resolve();

app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  }));

app.use('/:api/auth' , authRoutes);
app.use('/:api/messages' , messageRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("/*all" , (req,res) => {
        res.sendFile(path.join(__dirname , "../frontend" , "dist" , "index.html"))
    })
}

server.listen(PORT , () => {console.log(`Server is running at PORT : ${PORT}`)
    connectDB();
})