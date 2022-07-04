import {getCurrent} from "@tauri-apps/api/window";
import React from "react";

// Import your theme up here *USE LAZY, THAT'S WHAT MAKES THIS ALL WORK*
const NewHorizonsLight = React.lazy(() => import("./Themes/NewHorizonsLight"));
const NewHorizonsDark = React.lazy(() => import("./Themes/NewHorizonsDark"));

// Add your theme name here
export type Theme =
    "Follow System" |
    "Default Light" |
    "Default Dark";

// Finally, map your theme name to the component
const ThemeMap: { [key in Theme]: JSX.Element } = {
    "Follow System": await getCurrent().theme() === "dark" ? <NewHorizonsDark/> : <NewHorizonsLight/>,
    "Default Light": <NewHorizonsLight/>,
    "Default Dark": <NewHorizonsDark/>
};

function ThemeManager(props: { theme: Theme }) {
    return <React.Suspense fallback={<></>}>
        {ThemeMap[props.theme]}
    </React.Suspense>;
}

export default ThemeManager;
