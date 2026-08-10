import * as path from "node:path";

export const PORT = process.env.PORT || 8080;
export const LOCAL_BASE_URL = `http://localhost:${PORT}`;
export const PUBLIC_BASE_URL = "fake_domain_for_now"; // tbd

export const PAGES_REL_PATH = "./pages";
export const PAGES_ABS_PATH = path.join(process.cwd(), PAGES_REL_PATH);
export const RENDERS_REL_PATH = "./renders";
export const RENDERS_ABS_PATH = path.join(process.cwd(), RENDERS_REL_PATH);

export const DASHBOARDS_REL_URL = "/boards";
export const DASHBOARDS_LOCAL_URL = LOCAL_BASE_URL + DASHBOARDS_REL_URL;
export const DASHBOARDS_PUBLIC_URL = PUBLIC_BASE_URL + DASHBOARDS_REL_URL;
export const RENDERS_REL_URL = "/renders";
export const RENDERS_LOCAL_URL = LOCAL_BASE_URL + RENDERS_REL_URL;
export const RENDERS_PUBLIC_URL = PUBLIC_BASE_URL + RENDERS_REL_URL;

export const DATACACHE_REL_PATH = "./scripts/data/cached";
export const DATACACHE_ABS_PATH = path.join(process.cwd(), DATACACHE_REL_PATH);