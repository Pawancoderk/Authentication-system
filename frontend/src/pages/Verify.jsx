import axios from 'axios'
import React from 'react'
import { server } from '../main'
import { useParams } from 'react-router-dom'
import Loading from '../loading'
import { useState, useEffect } from 'react'

const Verify = () => {
  const [sucessMessage, setSucessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const param = useParams()

  const [loading, setLoading] = useState(true)

  async function verifyUser() {
    try {
      const { data } = await axios.post(`${server}/api/v1/verify/${param.token}`)
      setSucessMessage(data.message)
    } catch (error) {
      setErrorMessage("Verification link expired")
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
   verifyUser()
  },[])
  return (
    <>
      {
        loading ? <Loading /> : <div className='w-[200px] m-auto mt-12-'>
          {sucessMessage && <p className='text-green-500 text-2xl'>{sucessMessage} </p>}
          {errorMessage && <p className='text-red-500 text-2xl'>{errorMessage} </p>}
        </div>
      }
    </>
  )
}

export default Verify