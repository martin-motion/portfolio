import { projects } from "../data/projects.js";
import { siteContent } from "../data/site-content.js";
import { applySiteContent } from "./content.js";
import { initPortfolioApp } from "./portfolio-app.js";

applySiteContent(siteContent);
initPortfolioApp(projects);
