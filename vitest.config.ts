import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		coverage: {
			exclude: ["src/**/*.test.ts", "src/index.ts"],
			include: ["src/**/*.ts"],
			reporter: ["text", "html"],
		},
		include: ["src/**/*.test.ts"],
	},
});
