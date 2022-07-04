import {menuBar} from "./Actions";
import MenuBarGroup from "./MenuBarGroup";

function MenuBar() {

    return <div className="d-flex">
        {menuBar.groups.map((group, index) => <MenuBarGroup group={group} key={index}/>)}
    </div>;
}

export default MenuBar;
