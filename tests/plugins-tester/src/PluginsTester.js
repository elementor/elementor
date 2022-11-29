import {execSync} from "child_process";

export class PluginsTester {
	debug = false;
	pluginsToTest = [];
	pwd = '';
	logger;

	constructor(options) {
		Object.entries(options).forEach(([key, value]) => {
			this[key] = value;
		});

		this.run();
	}

	async run() {
		this.setPwd();
		this.runServer();
		this.prepareTestSite();
		this.checkPlugins();
	}

	cmd(cmd) {
		this.logger.info('cmd', cmd);
		try {
			const result = execSync(cmd).toString();
			this.logger.info('success', result);

			return result;
		} catch (e) {
			throw e;
		}
	};

	checkPlugins() {
		const errors = [];
		this.pluginsToTest.forEach( (slug) => {
			this.cmd(`npx wp-env run cli wp plugin install ${slug} --activate`);
			this.cmd(`npx wp-env run cli wp plugin activate ${slug}`);
			this.cmd(`npx wp-env run cli wp plugin list`);
			// get wp site url
			const siteUrl = this.cmd(`npx wp-env run cli wp option get siteurl`).trim();
			// Some plugins have a welcome message for the first time.
			this.cmd(`curl ${siteUrl}/law-firm-about/?elementor`);
			try {
				this.cmd(`node ./scripts/run-backstop.js --slug=${slug}`);
			} catch (error) {
				this.logger.error(error);
				errors.push({
					slug,
					error,
				});
			}

			this.cmd(`npx wp-env run cli wp plugin deactivate ${slug}`);
		});

		this.logger.error('errors:', errors);

		if (errors.length) {
			process.exit(1);
		}
	}

	runServer() {
		this.cmd('npm run wp-env start');
	}

	setPwd() {
		this.cmd(`cd ${this.pwd}`)
	}

	prepareTestSite() {
		this.cmd(`npx wp-env run cli wp theme activate hello-elementor`);
		try {
			this.cmd(`npx wp-env run cli "wp --user=admin elementor library import-dir /var/www/html/elementor-templates"`);
		} catch (error) {
			this.logger.error(error);
		}

		this.cmd(`npx wp-env run cli wp rewrite structure "/%postname%/" --hard`);
		this.cmd(`npx wp-env run cli wp cache flush`);
		this.cmd(`npx wp-env run cli wp rewrite flush --hard`);
		this.cmd(`npx wp-env run cli wp elementor flush-css`);
		this.cmd(`npx wp-env run cli wp post list --post_type=page`);
	}

	cleanup() {
		// Cleanup old reports
		// fs.rmSync( __dirname + '/reports/', { recursive: true, force: true } );
	}
}
