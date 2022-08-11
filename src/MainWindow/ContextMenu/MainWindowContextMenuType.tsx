import { PropsWithChildren } from "react";
import { connect } from "react-redux";
import { contextMenu } from "../Store/ContextMenuSlice";
import { Dropdown } from "react-bootstrap";
import { RootState } from "../Store/Store";

function MainWindowContextMenuType(props: { id: string; isOpen?: boolean } & PropsWithChildren) {
    return (
        <Dropdown.Menu show={props.isOpen} popperConfig={{ strategy: "absolute" }}>
            {props.children}
        </Dropdown.Menu>
    );
}

const mapStateToProps = () => {
    const isOpenSelector = contextMenu.selectMenuIsSelectedFactory();
    return (state: RootState, ownProps: { id: string }) => {
        return {
            isOpen: isOpenSelector(state.contextMenu, ownProps.id)
        };
    };
};

export default connect(mapStateToProps)(MainWindowContextMenuType);
