import {message, open} from "@tauri-apps/api/dialog";
import {documentDir, resolveResource, sep} from "@tauri-apps/api/path";
import {invoke} from "@tauri-apps/api/tauri";
import {FormEvent, useState} from "react";
import {Form, InputGroup} from "react-bootstrap";
import {Folder2Open} from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import RecentProjects from "../Common/AppData/RecentProjects";
import {Project} from "../Common/Project";
import {useSettings} from "../Wrapper";

const docsFolder = (await documentDir()).slice(0, -1);

const templateContents = [
    ".gitattributes",
    ".gitignore",
    "default-config.json",
    "NewHorizonsConfig.dll",
    ".github/workflows/create-release.yml",
];

function NewProjectWindow() {

    const settings = useSettings();

    const [projectName, setProjectName] = useState(settings.defaultProjectName);
    const [authorName, setAuthorName] = useState(settings.defaultAuthor);
    const [parentPath, setParentPath] = useState(docsFolder);

    const uniqueName = `${authorName}.${projectName.replace(" ", "")}`;
    const projectPath = `${parentPath}${sep}${uniqueName}`;

    const browseClicked = () => {

        open({
            title: "Select folder",
            directory: true,
            multiple: false,
            defaultPath: parentPath,
        }).then(path => {
            if (path) {
                setParentPath(path as string);
            }
        });

    };

    const makeProject = async () => {

        await invoke("mk_dir", {path: projectPath});

        for (const file of templateContents) {
            const filePath = await resolveResource(`resources${sep}new_project_template${sep}${file}`);
            await invoke("copy_file", {src: filePath, dest: `${projectPath}${sep}${file}`});
        }

        await invoke("write_string_to_file", {
            path: `${projectPath}${sep}manifest.json`,
            content: JSON.stringify({
                filename: "NewHorizonsConfig.dll",
                author: authorName,
                name: projectName,
                uniqueName: uniqueName,
                version: "0.0.0",
                owmlVersion: "2.1.0",
                dependencies: ["xen.NewHorizons"],
            })
        });

        await invoke("mk_dir", {path: `${projectPath}${sep}planets`});
        await invoke("mk_dir", {path: `${projectPath}${sep}systems`});
        await invoke("mk_dir", {path: `${projectPath}${sep}translations`});

        const newProject = new Project(projectName, uniqueName, projectPath);
        const data = await RecentProjects.get();
        data.unshift(newProject);
        await RecentProjects.save(data);

        await newProject.openInMain();
    };

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        invoke("file_exists", {path: projectPath}).then(exists => {
            if (exists) {
                message("This project already exists", {
                    type: "error",
                    title: "Error",
                });
            } else {
                makeProject();
            }
        });
    };

    return <Container className="mb-2 mt-4">
        <Row>
            <h1 className="text-center">New Project</h1>
        </Row>
        <Form onSubmit={(e) => onSubmit(e)} className="d-flex flex-column">
            <Form.Label htmlFor="projectName">Project Name</Form.Label>
            <Form.Control id="projectName" required value={projectName} onChange={(e) => setProjectName(e.target.value)}
                          type="text"/>
            <Form.Label className="mt-3" htmlFor="authorName">Author Name</Form.Label>
            <Form.Control id="authorName" required value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                          type="text"/>
            <Form.Label className="mt-3" htmlFor="uniqueName">Unique Name</Form.Label>
            <Form.Control id="uniqueName" required value={uniqueName} type="text" disabled/>
            <Form.Label className="mt-3" htmlFor="projectFolder">Folder</Form.Label>
            <InputGroup className="mb-2">
                <Button className="d-flex align-items-center" onClick={() => browseClicked()} variant="outline-primary"
                        aria-lable="Browse" type="button"><Folder2Open/></Button>
                <Form.Control onChange={(e) => setParentPath(e.target.value)}
                              id="projectFolder" value={parentPath} required type="text"/>
                <InputGroup.Text>{uniqueName}</InputGroup.Text>
            </InputGroup>
            <Button className="mt-5" variant="primary" type="submit">Create Project</Button>
        </Form>
    </Container>;

}

export default NewProjectWindow;
