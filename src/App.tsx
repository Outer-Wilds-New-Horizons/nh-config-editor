import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import 'bootstrap/dist/css/bootstrap.min.css';

import Inspector from "./Panels/Inspector/Inspector";

function App() {
    return (
        <div className="App h-100">
            <Container fluid>
                <Row className={"h-100"}>
                    <Inspector/>
                </Row>
            </Container>
        </div>
    )
}

export default App
