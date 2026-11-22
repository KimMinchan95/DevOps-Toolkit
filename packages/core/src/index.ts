export type ToolId = "json-formatter" | "unix-timestamp" | "uuid-generator";

export const toolIds: ToolId[] = ["json-formatter", "unix-timestamp", "uuid-generator"];

export { formatJson, minifyJson, offsetAt, type JsonFailure, type JsonIssue, type JsonResult } from "./json";
