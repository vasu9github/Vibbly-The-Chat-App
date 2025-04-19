import User from "../models/userModel.js";
import Message from '../models/messageModel.js'
import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId , io } from "../lib/socket.js";


export const getUsersForSidebar = async ( req , res ) => {
    try {
         const loggedInUserId = req.user._id;
         const filteredUsers = await User.find({_id: {$ne : loggedInUserId}}).select("-password")

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log(`error in messageController :` , error)
        res.status(500).json({message : "Internal server error"});
    }
}

export const getMessages = async ( req , res ) => {
    try {
        const {id : userToChatID} = req.params
        const myId = req.user._id;

        const messages = await Message.find({
            $or :  [
                { senderId : myId , receiverId : userToChatID },
                { senderId : userToChatID , receiverId : myId  }
            ]
        })
        res.status(200).json(messages)
    } catch (error) {
        console.log(`Error in message controller ${error}`)
        res.status(500).json({error : "Internal Server Error"})
    }
}

export const sendMessage = async (req , res) => {
    try {
        const { text , image } = req.body
        const { id : receiverId } = req.params
        const senderId = req.user._id;

        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });

        await newMessage.save();

        // Realtime functionality baad me dalenge socket IO jo yaha par implement krni hai

        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage" , newMessage)
        }

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage controller :" , error.message)
        res.status(500).json({Error : "Internal server error"})
    }
}