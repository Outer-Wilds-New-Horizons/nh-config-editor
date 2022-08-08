import { getCurrent } from "@tauri-apps/api/window";
import React, { useEffect } from "react";

// Import your theme up here *USE LAZY, THAT'S WHAT MAKES THIS ALL WORK*
const NewHorizonsLight = React.lazy(() => import("./Themes/NewHorizonsLight"));
const NewHorizonsDark = React.lazy(() => import("./Themes/NewHorizonsDark"));

// Add your theme name here
export type Theme = "Follow System" | "Default Light" | "Default Dark";

// Map your theme name to the component
const ThemeMap: { [key in Theme]: JSX.Element } = {
    "Follow System": <></>,
    "Default Light": <NewHorizonsLight />,
    "Default Dark": <NewHorizonsDark />
};

// Also set the editor theme
export const ThemeMonacoMap: { [key in Theme]: string } = {
    "Follow System": "",
    "Default Light": "vs",
    "Default Dark": "vs-dark"
};

function ThemeManager(props: { theme: Theme }) {
    const [systemTheme, setSystemTheme] = React.useState<"dark" | "light" | null>(null);

    useEffect(() => {
        getCurrent().theme().then(setSystemTheme);
    }, []);

    if (systemTheme === null) {
        return <></>;
    } else {
        let theme = props.theme;
        if (theme === "Follow System") {
            theme = systemTheme === "dark" ? "Default Dark" : "Default Light";
        }
        return <React.Suspense fallback={<></>}>{ThemeMap[theme]}</React.Suspense>;
    }
}

export default ThemeManager;
