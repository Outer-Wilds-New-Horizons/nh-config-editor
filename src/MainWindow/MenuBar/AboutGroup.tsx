import { dialog } from "@tauri-apps/api";
import { open } from "@tauri-apps/api/shell";
import {
    ArrowRepeat,
    FileEarmarkArrowDownFill,
    InfoCircleFill,
    QuestionCircleFill
} from "react-bootstrap-icons";
import { openAboutWindow } from "../../AboutWindow/AboutWindow";
import SchemaStoreManager from "../../Common/AppData/SchemaStore";
import IconDropDownItem from "../../Common/IconDropDownItem";
import { useAppSelector } from "../Store/Hooks";
import { selectFilesHaveUnsavedChanges } from "../Store/OpenFilesSlice";
import MenuBarGroup from "./MenuBarGroup";

function HelpItem() {
    const onClick = () => {
        open("https://nh.outerwildsmods.com/editor.html");
    };
    return (
        <IconDropDownItem
            annotation="F1"
            shortcut="f1"
            onClick={onClick}
            id="help"
            label="Help"
            icon={<QuestionCircleFill />}
        />
    );
}

function AboutItem() {
    return (
        <IconDropDownItem
            annotation="F2"
            shortcut="f2"
            onClick={openAboutWindow}
            id="about"
            label="About"
            icon={<InfoCircleFill />}
        />
    );
}

const confirmReload = async () =>
    await dialog.ask("There are unsaved changes. Are you sure you want to reload?", {
        type: "warning",
        title: "Reload"
    });

function ReloadSchemasItem() {
    const filesHaveChanged = useAppSelector((state) =>
        selectFilesHaveUnsavedChanges(state.openFiles)
    );

    const reloadSchemas = async () => {
        await SchemaStoreManager.reset();
        window.location.reload();
    };

    const onClick = async () => {
        if (filesHaveChanged) {
            const result = await confirmReload();
            if (result) {
                await reloadSchemas();
            }
        } else {
            await reloadSchemas();
        }
    };

    return (
        <IconDropDownItem
            annotation="Ctrl+Shift+R"
            shortcut="ctrl+shift+r,command+shift+r"
            onClick={onClick}
            id="reloadSchemas"
            label="Reload Schemas"
            icon={<FileEarmarkArrowDownFill />}
        />
    );
}

function ReloadItem() {
    const filesHaveChanged = useAppSelector((state) =>
        selectFilesHaveUnsavedChanges(state.openFiles)
    );

    const onClick = async () => {
        if (filesHaveChanged) {
            const result = await confirmReload();
            if (result) {
                window.location.reload();
            }
        } else {
            window.location.reload();
        }
    };

    return (
        <IconDropDownItem
            annotation="Ctrl+R"
            shortcut="ctrl+r,command+r,f5"
            onClick={onClick}
            id="softReset"
            label="Reload"
            icon={<ArrowRepeat />}
        />
    );
}

export function AboutGroup() {
    return (
        <MenuBarGroup name="About">
            <HelpItem />
            <AboutItem />
            <IconDropDownItem id="separator" />
            <ReloadSchemasItem />
            <ReloadItem />
        </MenuBarGroup>
    );
}
