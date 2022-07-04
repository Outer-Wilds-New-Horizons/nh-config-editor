import {Event, listen} from "@tauri-apps/api/event";
import React from "react";
import {Settings, SettingsManager} from "./Common/AppData/Settings";
import "./Common/common.css";
import CenteredSpinner from "./Common/Spinner/CenteredSpinner";
import ThemeManager from "./Common/Theme/ThemeManager";

const MainWindow = React.lazy(() => import("./MainWindow/MainWindow"));
const StartWindow = React.lazy(() => import("./StartWindow/StartWindow"));
const SettingsWindow = React.lazy(() => import("./SettingsWindow/SettingsWindow"));
const NewProjectWindow = React.lazy(() => import("./NewProjectWindow/NewProjectWindow"));
const AboutWindow = React.lazy(() => import("./AboutWindow/AboutWindow"));

const loadedSettings = await SettingsManager.get();
const SettingsContext = React.createContext(loadedSettings);

function Wrapper() {

    const [settings, setSettings] = React.useState(loadedSettings);

    listen("nh://settings-changed", (event: Event<Settings>) => {
        setSettings(event.payload);
    });

    listen("nh://reload", () => {
        window.location.reload();
    });

    let page: JSX.Element;

    switch (document.location.hash) {
        case "#MAIN":
            page = <MainWindow/>;
            break;
        case "#SETTINGS":
            page = <SettingsWindow/>;
            break;
        case "#ABOUT":
            page = <AboutWindow/>;
            break;
        case "#NEWPROJECT":
            page = <NewProjectWindow/>;
            break;
        case "#START":
        default:
            page = <StartWindow/>;
            break;
    }

    return <SettingsContext.Provider value={settings}>
        <ThemeManager theme={settings.theme}/>
        <React.Suspense fallback={<CenteredSpinner/>}>
            {page}
        </React.Suspense>
    </SettingsContext.Provider>;
}

export default Wrapper;
export const useSettings = () => React.useContext(SettingsContext);
