import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";


const ThemeContext =
    createContext(null);


export function ThemeProvider({
    children
}) {

    const [
        theme,
        setTheme
    ] = useState(() => {

        const savedTheme =
            localStorage.getItem(
                "fleetrent-theme"
            );


        return (
            savedTheme === "dark"
                ? "dark"
                : "light"
        );

    });


    useEffect(() => {

        document.documentElement
            .setAttribute(
                "data-theme",
                theme
            );


        localStorage.setItem(
            "fleetrent-theme",
            theme
        );

    }, [theme]);


    const toggleTheme = () => {

        setTheme(
            current =>
                current === "light"
                    ? "dark"
                    : "light"
        );

    };


    return (

        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme
            }}
        >
            {children}
        </ThemeContext.Provider>

    );

}


export function useTheme() {

    return useContext(
        ThemeContext
    );

}