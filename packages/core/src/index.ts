export type ToolId = "json-formatter" | "unix-timestamp" | "uuid-generator";

export const toolIds: ToolId[] = ["json-formatter", "unix-timestamp", "uuid-generator"];

export { formatJson, minifyJson, type JsonFailure, type JsonResult } from "./json";
