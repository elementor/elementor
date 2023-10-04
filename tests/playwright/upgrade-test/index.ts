
import { execSync } from 'child_process';

export class UpgradeElementor {
	cmd( cmd: string ) {
		return execSync( cmd ).toString();
	}

	getBuild() {
		this.cmd( 'cd ../../../ && mv ./build/* elementor && zip -r elementor elementor' );
		this.cmd( 'cd ../../../ && mv ./elementor.zip ./tests/playwright/upgrade-test/plugin' );
	}

	runServer() {
		this.cmd( 'npx wp-env start' );
	}

	installLatestPluginFromWP() {
		this.cmd( `npx wp-env run cli wp plugin install elementor --activate` );
	}

	installCurrentPlugin() {
		this.cmd( `npx wp-env run cli wp plugin install ./plugin/elementor.zip --force --activate` );
	}
}

const runner = new UpgradeElementor();
runner.getBuild();
runner.runServer();
runner.installLatestPluginFromWP();
runner.installCurrentPlugin();
