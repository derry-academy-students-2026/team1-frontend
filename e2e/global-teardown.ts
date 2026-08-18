/**
 * Runs once after the whole suite finishes. The frontend keeps no state
 * between runs (sessions are per-browser-context and data lives in the
 * backend's seeded database), so this is a hook for future shared artifacts
 * (e.g. a saved auth storage state) that would need clearing here.
 */
export default async function globalTeardown() {
	console.log("E2E suite finished.");
}
