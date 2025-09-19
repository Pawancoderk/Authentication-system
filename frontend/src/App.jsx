import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Login'
import { ToastContainer } from "react-toastify"
import VerifyOpt from './pages/Verify-opt'
import { AppData } from './context/AppContext'
import Loading from './loading'
import Register from './pages/Register'
import Verify from './pages/Verify'

function App() {
    const { isAuth, loading } = AppData()

    return <>
        {loading ? <Loading /> : <BrowserRouter>
            <Routes>
                <Route path='/' element={isAuth ? <Home />: <Login/>} />
                <Route path='/login' element={isAuth ? <Home />: <Login/>} />
                <Route path='/verifyotp' element={isAuth ? <Home />: <VerifyOpt/>} />
                <Route path='/register' element={isAuth ? <Home />: <Register/>} />
                <Route path='/token/:token' element={isAuth ? <Home />: <Verify/>} />
            </Routes>
            <ToastContainer />
        </BrowserRouter>}

    </>
}

export default App
