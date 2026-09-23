import type { DialBrioApi } from "./types";
import { httpApi } from "./http";
import { mockApi } from "./mock";

export type { DialBrioApi } from "./types";
export { ApiError } from "./types";

/** "mock" (default until the API ships) or "http". Components never import this — only lib/queries does. */
export const API_MODE = (process.env.NEXT_PUBLIC_API_MODE ?? "mock") as "mock" | "http";

export const api: DialBrioApi = API_MODE === "http" ? httpApi : mockApi;
