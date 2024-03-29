import { errorProject, loadProject, Project } from "../Project";
import AppData from "./AppData";

type RawRecentProjects = string[];

const manager = new AppData<RawRecentProjects>("recent_projects.json", []);

export default class RecentProjects {
    static async get(): Promise<Project[]> {
        const projectPaths = await manager.get();
        const projects = [];
        for (const path of projectPaths) {
            if (projects.filter((p) => p.path === path).length === 0) {
                let project = errorProject(path);
                try {
                    project = await loadProject(path);
                } catch (e) {
                    project = errorProject(path);
                }
                projects.push(project);
            }
        }
        return projects;
    }

    static async save(data: Project[]) {
        const projectPaths = data.map((project) => project.path);
        await manager.save(projectPaths);
    }
}
