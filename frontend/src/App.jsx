import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import { axiosInstance } from './lib/axios'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'
import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'


const App = () => {
  const {authUser , checkAuth , isCheckingAuth , onlineUsers} = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  console.log({ authUser })

  if( isCheckingAuth && !authUser ) return (
    <div className='flex items-center justify-center h-screen'>
      <Loader className='size-10 animate-spin'/>
    </div>
  )

  return (
    <div data-theme={theme}>    
    <Navbar/>
    <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login" />} />
      </Routes>

    <Toaster/>
    </div>
  )
}

export default App