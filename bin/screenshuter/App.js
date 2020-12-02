'use strict';

/**
 * Import test functions included config params
 */
const BaseApp = require( './BaseApp' );

class App extends BaseApp {
	constructor() {
		super();
		this.run();
	}

	run() {
		/**
		 * The below functions running basic test
		 */
		this.installWpCli();
		this.installPackagesForImagesCompare();
		this.downloadWpCore();
		this.config();
		this.install();
		this.installPlugins();
		this.installThemes();
		this.importTestTemplates();

		this.runBuild();
		this.runWpServer();
		this.testScreenshots();
		this.killServerProcess();

		/**
		 * Decided if clean local env
		 */
		this.cleanLocalTestsEnv();
	}
}

module.exports = App;
