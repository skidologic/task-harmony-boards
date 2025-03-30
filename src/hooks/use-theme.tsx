
import * as React from "react"
import { useLocalStorage } from "./use-local-storage"

type Theme = "dark" | "light" | "system"

export function useTheme() {
  const [theme, setThemeState] = useLocalStorage<Theme>("theme", "system")
  
  const setTheme = React.useCallback((theme: Theme) => {
    const root = window.document.documentElement
    
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      
      root.classList.add(systemTheme)
      setThemeState("system")
    } else {
      root.classList.add(theme)
      setThemeState(theme)
    }
  }, [setThemeState])
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        const root = window.document.documentElement
        
        root.classList.remove("light", "dark")
        root.classList.add(systemTheme)
      }
    }
    
    mediaQuery.addEventListener("change", handleChange)
    
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])
  
  React.useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])
  
  return { theme, setTheme }
}