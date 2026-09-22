import { useEffect,useState } from "react";

export function useDarkMode(){
    const[isDark,setIsDark]=useState(()=>{
        const saved=localStorage.getItem("theme");
        if(saved){
            return saved==="dark";
        }
        return window.matchMedia("(prefers-color-scheme:dark)").matches;
    });

    useEffect(()=>{
        document.documentElement.classList.toggle("dark",isDark);
        localStorage.setItem("theme",isDark?"dark":"light");
    },[isDark]);

    return [isDark,setIsDark];
}