import "server-only";
import { getAdminData } from "./data";
import { CmsError } from "./schema";
import { backend } from "./store";

/** Loads admin data, turning Google errors into a message the page can show. */
export async function loadAdmin() {
  const kind = backend();
  try {
    return { ok: true as const, data: await getAdminData(), backend: kind };
  } catch (error) {
    if (!(error instanceof CmsError)) console.error("[admin] load failed", error);
    return {
      ok: false as const,
      backend: kind,
      message: error instanceof CmsError ? error.message : "The content could not be loaded. Please try again.",
    };
  }
}
