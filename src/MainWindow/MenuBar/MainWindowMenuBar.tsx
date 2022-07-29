import { AboutGroup } from "./AboutGroup";
import { FileGroup } from "./FileGroup";
import MenuBar, { MenuBarProps } from "./MenuBar";
import { ProjectGroup } from "./ProjectGroup";

function MainWindowMenuBar(props: MenuBarProps) {
    return (
        <MenuBar {...props}>
            <FileGroup />
            <ProjectGroup />
            <AboutGroup />
        </MenuBar>
    );
}

export default MainWindowMenuBar;
