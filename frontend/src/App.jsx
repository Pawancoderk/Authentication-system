import { useState } from 'react'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Login'
import {ToastContainer} from "react-toastify"
import VerifyOpt from './pages/Verify-opt'

function App() {
  
 return<>
 <BrowserRouter>
 <Routes>
  <Route path='/' element={<Home/>}/>
  <Route path='/login' element={<Login/>}/>
  <Route path='/verifyotp'element={<VerifyOpt/>}  />
 </Routes>
 <ToastContainer/>
 </BrowserRouter>

 </>
}

export default App
