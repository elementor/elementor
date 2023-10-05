/* eslint-disable no-console */

import { execSync } from 'child_process';
export class UpgradeElementor {
	cmd( cmd: string ) {
		console.log( cmd );
		const text = execSync( cmd ).toString();
		console.log( text );
	}

	cleanUpBeforeTest() {
		if ( ! process.env.CI ) {
			this.cmd( 'rm -rf  plugin' );
			this.cmd( 'rm -rf  ../../../elementor' );
		}
	}

	getBuild() {
		this.cmd( 'mkdir plugin' );
		this.cmd( 'cd ../../../ && mkdir elementor' );
		this.cmd( 'cd ../../../ && cp -r ./build/* elementor && zip -r elementor elementor' );
		this.cmd( 'cd ../../../ && mv ./elementor.zip ./tests/playwright/upgrade-test/plugin' );
	}

	runServer() {
		this.cmd( 'npx wp-env start' );
	}

	installLatestPluginFromWP() {
		this.cmd( `npx wp-env run cli wp plugin install elementor --activate` );
		this.cmd( 'npx wp-env run cli wp plugin list' );
	}

	installCurrentPlugin() {
		this.cmd( `npx wp-env run cli wp plugin install ./plugin/elementor.zip --force` );
		this.cmd( 'npx wp-env run cli wp plugin list' );
	}
}

const runner = new UpgradeElementor();
runner.cleanUpBeforeTest();
runner.getBuild();
runner.runServer();
runner.installLatestPluginFromWP();
runner.installCurrentPlugin();
