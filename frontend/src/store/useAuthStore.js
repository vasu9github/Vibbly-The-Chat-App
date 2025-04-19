import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from 'socket.io-client'

const baseUrl = import.meta.env.MODE === "development" ? 'http://localhost:5000' : "/"

export const useAuthStore = create((set , get) => ({
    authUser : null,
    isSigningUp : false,
    isLoggingIng : false,
    isUpdatingProfile : false,
    isCheckingAuth : true,
    onlineUsers : [],
    socket: null,

    checkAuth : async () => {
        try {
            const response = await axiosInstance.get("/auth/check" , {withCredentials:true});

            set({ authUser : response.data })
            get().connectSocket();
        } catch (error) {
            set({authUser : null})
            console.log('Error in checkAuth :' , error)
        }
        finally{
            set({isCheckingAuth : false})
        }
    },
    signup : async (data) => {
        set({ isSigningUp:true })
        try {
           const response = await axiosInstance.post("/auth/signup" , data)
           set({ authUser : response.data })
           toast.success("Account created sucessfully")
           get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
            console.log('Error in signup : ' , error)
        }
        finally{
            set({ isSigningUp : false });
        }
    },
    logout : async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set( { authUser : null } )
            toast.success("Logged out successfully")
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message)
            console.log('Error in logging out :' , error)
        }
    },

    login : async (data) => {
        set({isLoggingIng : true})
        try {
            const response = await axiosInstance.post("/auth/login" , data)

            set({ authUser : response.data})
            toast.success("User logged in sucessfully")

            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
            console.log('Error in loggin in :' , error)
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile : true});
        try {
            const response = await axiosInstance.put("auth/update-profile" , data )
            set({ authUser : response.data }) 
            toast.success("Profile updated sucessfully")
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("Error in updating profile" , error)
        }
        finally{
            set({ isUpdatingProfile : false });
        }
    },

    connectSocket : () => {
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return;
        
        const socket = io(baseUrl , {
            query : {
                userId : authUser._id,
            }
        })
        socket.connect()

        set({ socket : socket })

        socket.on("getOnlineUsers" , (userIds) => {
            set({ onlineUsers : userIds})
        })
    },
    disconnectSocket : () => {
        if (get().socket?.connected) get().socket.disconnect();
    }
}))

