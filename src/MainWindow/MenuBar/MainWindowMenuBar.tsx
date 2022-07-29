import {
    ArrowRepeat,
    CaretRightFill,
    FileEarmarkArrowDownFill,
    FolderFill,
    InfoCircleFill,
    QuestionCircleFill,
    Tools,
    Wrench
} from "react-bootstrap-icons";
import IconDropDownItem from "../../Common/IconDropDownItem";
import { FileGroup } from "./FileGroup";
import MenuBar, { MenuBarProps } from "./MenuBar";
import MenuBarGroup from "./MenuBarGroup";

function MainWindowMenuBar(props: MenuBarProps) {
    return (
        <MenuBar {...props}>
            <FileGroup />
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
