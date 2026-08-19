const common = {
	paths: ["e2e/bdd/features/**/*.feature"],
	import: ["e2e/bdd/steps/**/*.ts"],
	format: ["progress-bar", "html:playwright-report/cucumber-report.html"],
	publishQuiet: true,
};

module.exports = {
	default: common,
};
