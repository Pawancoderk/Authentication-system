import { createContext, useContext, useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import {server} from "../main";

const AppContext = createContext();

export const AppProvider = ({children})=>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    async function FetchUser(){
        setLoading(true)
        try {
            const {data} = await axios.get(`${server}/api/v1/me`,{withCredentials: true});
            setUser(data);
            setIsAuth(true)

        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        FetchUser()
    },[])

    return <AppContext.Provider value={{user, setIsAuth, isAuth, loading, setUser}}>{children}</AppContext.Provider>
}

export const AppData = ()=>{
    const context = useContext(AppContext);
    if(!context) throw new Error("AppContext must be used within AppProvider");
    return context;
}