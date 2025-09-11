import { createContext, useContext, useEffect } from "react";
import { useState } from "react";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const AppContext = createContext();

export const AppProvider = ({children})=>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    async function FetchUser(){
        setLoading(true)
        try {
            const {data} = await api.get(`/api/v1/me`);
            setUser(data);
            setIsAuth(true)

        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    async function logoutUser(){
        try {
            const {data} = await api.post("/api/v1/logout");
            toast.success(data.message);
            setIsAuth(false)
            setUser(null)
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    useEffect(()=>{
        FetchUser()
    },[])

    return <AppContext.Provider value={{user, setIsAuth, isAuth, loading, setUser,logoutUser}}>{children}</AppContext.Provider>
}

export const AppData = ()=>{
    const context = useContext(AppContext);
    if(!context) throw new Error("AppContext must be used within AppProvider");
    return context;
}