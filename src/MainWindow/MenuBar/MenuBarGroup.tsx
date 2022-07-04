import { Dropdown } from "react-bootstrap";
import { ActionGroup } from "./Actions";
import MenuGroupItem from "./MenuGroupItem";

function MenuBarGroup(props: { group: ActionGroup }) {
    return (
        <Dropdown>
            <Dropdown.Toggle
                className="user-select-none py-0 me-3 menubar-item border-0"
                variant="light"
            >
                {props.group.title}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {props.group.actions.map((item, index) => {
                    return <MenuGroupItem key={index} item={item} />;
                })}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default MenuBarGroup;
