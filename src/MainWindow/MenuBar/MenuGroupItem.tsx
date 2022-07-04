import {Dropdown} from "react-bootstrap";
import {Action, ActionGroupItem} from "./Actions";

function MenuGroupItem(props: { item: ActionGroupItem }) {
    if (props.item === "separator") {
        return <Dropdown.Divider/>;
    } else {
        return <Dropdown.Item className="d-flex" onClick={() => (props.item as Action).callback()}>
            <span className="me-4">{props.item.name}</span> {props.item.shortcut &&
            <span className="text-muted ms-auto">{props.item.shortcut.replace("CommandOrControl", "Ctrl")}</span>}
        </Dropdown.Item>;
    }
}

export default MenuGroupItem;
