import { contextMenu } from "../Store/ContextMenuSlice";
import { useAppDispatch, useAppSelector } from "../Store/Hooks";
import OpenFileContextMenu from "./OpenFileContextMenu";
import ProjectFileContextMenu from "./ProjectFileContextMenu";

function MainWindowContextMenu() {
    const dispatch = useAppDispatch();

    const isOpen = useAppSelector((state) => state.contextMenu.open);
    const currentPosition = useAppSelector((state) => state.contextMenu.position);

    document.onmouseup = () => {
        if (isOpen) {
            dispatch(contextMenu.closeMenu());
        }
    };

    return (
        <div
            className={`position-absolute top-0 bottom-0 end-0 start-0${isOpen ? "" : " d-none"}`}
            style={{ zIndex: 50, pointerEvents: "none" }}
        >
            <div
                className="position-absolute"
                style={{
                    top: `${currentPosition[1]}px`,
                    left: `${currentPosition[0]}px`,
                    zIndex: 60,
                    pointerEvents: "all"
                }}
            >
                <ProjectFileContextMenu />
                <OpenFileContextMenu />
            </div>
        </div>
    );
}

export default MainWindowContextMenu;
