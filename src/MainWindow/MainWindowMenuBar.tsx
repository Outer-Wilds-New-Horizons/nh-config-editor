import {
    ArrowRepeat,
    CaretRightFill,
    DashCircleFill,
    DoorOpenFill,
    FileCheckFill,
    FileEarmarkArrowDownFill,
    FileXFill,
    FolderFill,
    GearWide,
    HddFill,
    InfoCircleFill,
    QuestionCircleFill,
    Save2Fill,
    Tools,
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
                    icon={ProjectFile.getIconFromType("planet") ?? <></>}
                />
                <IconDropDownItem
                    id="newSystem"
                    label="New System"
                    icon={ProjectFile.getIconFromType("system") ?? <></>}
                />
                <IconDropDownItem
                    id="newTranslation"
                    label="New Translation"
                    icon={ProjectFile.getIconFromType("translation") ?? <></>}
                />
                <IconDropDownItem
                    id="makeManifest"
                    label="Create Addon Manifest"
                    icon={ProjectFile.getIconFromType("addon_manifest") ?? <></>}
                />
                <IconDropDownItem id="separator" />
                <IconDropDownItem id="save" label="Save" icon={<Save2Fill />} />
                <IconDropDownItem id="saveAll" label="Save All" icon={<FileCheckFill />} />
                <IconDropDownItem id="reloadFromDisk" label="Reload From Disk" icon={<HddFill />} />
                <IconDropDownItem id="closeAll" label="Close All" icon={<FileXFill />} />
                <IconDropDownItem id="separator" />
                <IconDropDownItem id="settings" label="Settings" icon={<GearWide />} />
                <IconDropDownItem id="separator" />
                <IconDropDownItem
                    id="closeProject"
                    label="Close Project"
                    icon={<DashCircleFill />}
                />
                <IconDropDownItem id="quit" label="Quit" icon={<DoorOpenFill />} />
            </MenuBarGroup>
            <MenuBarGroup name="Project">
                <IconDropDownItem
                    id="openExplorer"
                    label="Show in Explorer"
                    icon={<FolderFill />}
                />
                <IconDropDownItem id="run" label="Run" icon={<CaretRightFill />} />
                <IconDropDownItem id="output" label="Build Project (Debug)" icon={<Wrench />} />
                <IconDropDownItem id="build" label="Build Project (Release)" icon={<Tools />} />
            </MenuBarGroup>
            <MenuBarGroup name="About">
                <IconDropDownItem id="help" label="Help" icon={<QuestionCircleFill />} />
                <IconDropDownItem id="about" label="About" icon={<InfoCircleFill />} />
                <IconDropDownItem id="separator" />
                <IconDropDownItem
                    id="reloadSchemas"
                    label="Reload Schemas"
                    icon={<FileEarmarkArrowDownFill />}
                />
                <IconDropDownItem id="softReset" label="Reload" icon={<ArrowRepeat />} />
            </MenuBarGroup>
        </MenuBar>
    );
}

export default MainWindowMenuBar;
