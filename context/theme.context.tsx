import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import { colorScheme, useColorScheme as useNativewindColorScheme } from "nativewind";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Define your custom themes

const LightTheme = {
    dark: false,
    colors: {
        background: "#ffffff",
        text: "#000000",
    },
};

const DarkTheme = {
    dark: true,
    colors: {
        background: "#0f172a",
        text: "#ffffff",
    },
};

const ThemeContext = createContext({
    theme: LightTheme,
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }: any) => {

    const { setColorScheme } = useNativewindColorScheme();

    const systemColorScheme = useColorScheme();
    const [theme, setTheme] = useState(systemColorScheme === "dark" ? DarkTheme : LightTheme);

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem("userTheme");
            if (savedTheme) {
                setTheme(savedTheme === "dark" ? DarkTheme : LightTheme);
                setColorScheme(savedTheme === "dark" ? "dark" : "light");
            } else {
                setTheme(systemColorScheme === "dark" ? DarkTheme : LightTheme);
                setColorScheme("system");
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === DarkTheme ? LightTheme : DarkTheme;
        setTheme(newTheme);
        setColorScheme(newTheme.dark ? "dark" : "light");
        await AsyncStorage.setItem("userTheme", newTheme.dark ? "dark" : "light");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);