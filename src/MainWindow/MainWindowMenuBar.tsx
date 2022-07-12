import {
    ArrowRepeat,
    DoorOpen,
    FileCheck,
    FileEarmarkArrowDown,
    FileMedical,
    FileX,
    Folder2Open,
    FolderMinus,
    GearWide,
    Hdd,
    InfoCircle,
    QuestionCircle,
    Save2,
    Wrench
} from "react-bootstrap-icons";
import MenuBar, { MenuBarProps } from "./MenuBar/MenuBar";
import MenuBarGroup from "./MenuBar/MenuBarGroup";
import IconDropDownItem from "../Common/IconDropDownItem";
import { ProjectFile } from "./Panels/ProjectView/ProjectFile";

function MainWindowMenuBar(props: MenuBarProps) {
    return (
        <MenuBar {...props}>
            <MenuBarGroup name="File">
                <IconDropDownItem
                    id="newPlanet"
                    label="New Planet"
                    icon={ProjectFile.getIconForFileTypeAndExtension("planet")}
                />
                <IconDropDownItem
                    id="newSystem"
                    label="New System"
                    icon={ProjectFile.getIconForFileTypeAndExtension("system")}
                />
                <IconDropDownItem
                    id="newTranslation"
                    label="New Translation"
                    icon={ProjectFile.getIconForFileTypeAndExtension("translation")}
                />
                <IconDropDownItem
                    id="makeManifest"
                    label="Create Addon Manifest"
                    icon={<FileMedical />}
                />
                <IconDropDownItem id="separator" />
                <IconDropDownItem id="save" label="Save" icon={<Save2 />} />
                <IconDropDownItem id="saveAll" label="Save All" icon={<FileCheck />} />
                <IconDropDownItem id="reloadFromDisk" label="Reload From Disk" icon={<Hdd />} />
                <IconDropDownItem id="closeAll" label="Close All" icon={<FileX />} />
                <IconDropDownItem id="separator" />
                <IconDropDownItem id="settings" label="Settings" icon={<GearWide />} />
                <IconDropDownItem id="separator" />
                <IconDropDownItem id="closeProject" label="Close Project" icon={<FolderMinus />} />
                <IconDropDownItem id="quit" label="Quit" icon={<DoorOpen />} />
            </MenuBarGroup>
            <MenuBarGroup name="Project">
                <IconDropDownItem
                    id="openExplorer"
                    label="Show in Explorer"
                    icon={<Folder2Open />}
                />
                <IconDropDownItem id="build" label="Build Project" icon={<Wrench />} />
            </MenuBarGroup>
            <MenuBarGroup name="About">
                <IconDropDownItem id="help" label="Help" icon={<QuestionCircle />} />
                <IconDropDownItem id="about" label="About" icon={<InfoCircle />} />
                <IconDropDownItem id="separator" />
                <IconDropDownItem
                    id="reloadSchemas"
                    label="Reload Schemas"
                    icon={<FileEarmarkArrowDown />}
                />
                <IconDropDownItem id="softReset" label="Reload" icon={<ArrowRepeat />} />
            </MenuBarGroup>
        </MenuBar>
    );
}

export default MainWindowMenuBar;
