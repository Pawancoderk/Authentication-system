import axios from "axios";

const server = "http://localhost:3000";

const api = axios.create({
    baseURL: server,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token=null)=>{
    failedQueue.forEach((prom)=>{
        if(error){
            prom.reject(error)
        }else{
            prom.resolve(token)
        }
    });
    failedQueue = [];
}

api.interceptors.response.use((response)=> response, async(error)=>{
    const originalRequest = error.config;

    if(error.response.status === 403 && !originalRequest._retry){
        if(isRefreshing){
            return new Promise((resolve, reject)=>{
                failedQueue.push({resolve, reject});
            })
        }
    }
})