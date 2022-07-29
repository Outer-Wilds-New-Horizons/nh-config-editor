import { Event, listen } from "@tauri-apps/api/event";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Settings, SettingsManager } from "./Common/AppData/Settings";
import "./Common/common.css";
import CenteredSpinner from "./Common/Spinner/CenteredSpinner";
import ThemeManager from "./Common/Theme/ThemeManager";

const MainWindow = React.lazy(() => import("./MainWindow/MainWindow"));
const StartWindow = React.lazy(() => import("./StartWindow/StartWindow"));
const RunWindow = React.lazy(() => import("./RunWindow/RunWindow"));
const SettingsWindow = React.lazy(() => import("./SettingsWindow/SettingsWindow"));
const NewProjectWindow = React.lazy(() => import("./NewProjectWindow/NewProjectWindow"));
const AboutWindow = React.lazy(() => import("./AboutWindow/AboutWindow"));

const loadedSettings = await SettingsManager.get();
const SettingsContext = React.createContext(loadedSettings);

function Wrapper() {
    const [settings, setSettings] = React.useState(loadedSettings);

    listen("nh://settings-changed", (event: Event<string>) => {
        setSettings(JSON.parse(event.payload) as Settings);
    });

    listen("nh://reload", () => {
        window.location.reload();
    });

    useHotkeys("ctrl+p,command+p,ctrl+shift+p,command+shift+p", (e) => {
        e.preventDefault();
    });

    let page: JSX.Element;

    switch (document.location.hash) {
        case "#MAIN":
            page = <MainWindow />;
            break;
        case "#SETTINGS":
            page = <SettingsWindow />;
            break;
        case "#RUN":
            page = <RunWindow />;
            break;
        case "#ABOUT":
            page = <AboutWindow />;
            break;
        case "#NEWPROJECT":
            page = <NewProjectWindow />;
            break;
        case "#START":
        default:
            page = <StartWindow />;
            break;
    }

    return (
        <SettingsContext.Provider value={settings}>
            <ThemeManager theme={settings.theme} />
            <React.Suspense fallback={<CenteredSpinner />}>{page}</React.Suspense>
        </SettingsContext.Provider>
    );
}

export default Wrapper;
export const useSettings = () => React.useContext(SettingsContext);
