import {isRegistered, register} from "@tauri-apps/api/globalShortcut";
import {Dropdown} from "react-bootstrap";


export type ActionRegistry = {
    [key: string]: Action;
}

class Action {

    id: string;
    name: string;
    shortcut?: string;
    callback: CallableFunction;

    constructor(id: string, name: string, shortcut?: string) {
        this.id = id;
        this.name = name;
        this.shortcut = shortcut;
        this.callback = () => {
            console.error("Action not implemented");
        };
    }

    async register(actionRegistry: ActionRegistry) {

        if (this.shortcut && !(await isRegistered(this.shortcut))) {
            await register(this.shortcut, () => this.callback());
        }

        actionRegistry[this.id] = this;

    }

}

type ActionGroupItem = Action | "separator";

type ActionGroup = {
    title: string;
    actions: ActionGroupItem[];
}

type ActionBar = {
    groups: ActionGroup[];
}

const menuBar: ActionBar = {
    groups: [
        {
            title: "File",
            actions: [
                new Action("new_planet", "New Planet", "CommandOrControl+Shift+P"),
                new Action("new_system", "New Star System", "CommandOrControl+Shift+S"),
                new Action("new_translation", "New Translation", undefined),
                new Action("make_manifest", "Create Addon Manifest", "CommandOrControl+Shift+A"),
                "separator",
                new Action("save", "Save", "CommandOrControl+S"),
                new Action("save_all", "Save All", "CommandOrControl+Alt+S"),
                new Action("close_all", "Close All Files", "CommandOrControl+W"),
                new Action("reload", "Reload From Disk", "CommandOrControl+R"),
                new Action("close_project", "Close Project", "CommandOrControl+Alt+W"),
                "separator",
                new Action("quit", "Quit", "CommandOrControl+Q"),
            ]
        },
        {
            title: "Project",
            actions: [
                new Action("open_explorer", "Open Project In Explorer", "CommandOrControl+O"),
                new Action("build", "Build Project", "CommandOrControl+B")
            ]
        },
        {
            title: "About",
            actions: [
                new Action("about", "About", "CommandOrControl+A"),
                new Action("help", "Help", "CommandOrControl+H"),
                new Action("report_issue", "Report Issue", "CommandOrControl+I")
            ]
        }
    ]
};

export async function setupAllEvents(): Promise<ActionRegistry> {

    const actionRegistry: ActionRegistry = {};

    for (const group of menuBar.groups) {
        for (const action of group.actions) {
            if (action instanceof Action) {
                await action.register(actionRegistry);
            }
        }
    }

    return actionRegistry;

}

function MenuGroupItem(props: { item: ActionGroupItem }) {
    if (props.item !== "separator") {
        return <Dropdown.Item onClick={() => (props.item as Action).callback()}>
            {props.item.name}
        </Dropdown.Item>;
    } else {
        return <Dropdown.Divider/>;
    }
}

function MenuBarItem(props: { group: ActionGroup }) {
    return <Dropdown>
        <Dropdown.Toggle className="user-select-none py-0 me-3 menubar-item border-0"
                         variant="light">{props.group.title}</Dropdown.Toggle>
        <Dropdown.Menu>
            {props.group.actions.map((item, index) => {
                    return <MenuGroupItem key={index} item={item}/>;
                }
            )}
        </Dropdown.Menu>
    </Dropdown>;
}

export function MenuBar() {
    return <div className="d-flex">
        {menuBar.groups.map((group, index) => <MenuBarItem group={group} key={index}/>)}
    </div>;
}

