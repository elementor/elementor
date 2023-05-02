import { execSync } from 'child_process';

export class PluginsTester {
	options = {
		runServer: true,
		debug: false,
		pluginsToTest: [],
		cwd: '',
		logger: null,
	};

	constructor( options ) {
		Object.assign( this.options, options );

		this.run();
	}

	async run() {
		if ( this.options.runServer ) {
			this.setCwd();
			this.runServer();
			this.prepareTestSite();
		}

		this.checkPlugins();
	}

	cmd( cmd ) {
		this.options.logger.info( 'cmd', cmd );

		return execSync( cmd ).toString();
	}

	runWP( cmd ) {
		if ( ! this.options.runServer ) {
			return this.cmd( `cd ../../ && ${ cmd }` );
		}
		return this.cmd( cmd );
	}

	checkPlugins() {
		const errors = [];
		this.options.pluginsToTest.forEach( ( slug ) => {
			this.runWP( `npx wp-env run cli wp plugin install ${ slug } --activate` );

			try {
				this.cmd( `node ./scripts/run-backstop.js --slug=${ slug } --diffThreshold=${ this.options.diffThreshold }` );
			} catch ( error ) {
				this.options.logger.error( error );
				errors.push( {
					slug,
					error,
				} );
			}

			this.runWP( `npx wp-env run cli wp plugin deactivate ${ slug }` );
		} );

		if ( errors.length ) {
			this.cmd( `mkdir -p errors-reports` );

			const slugs = errors.map( ( error ) => error.slug );
			slugs.forEach( ( slug ) => {
				this.cmd( `mv reports/${ slug } errors-reports/${ slug }` );
			} );

			this.options.logger.error( slugs );

			process.exit( 1 );
		}
	}

	runServer() {
		this.cmd( 'npm run wp-env start' );
	}

	setCwd() {
		this.cmd( `cd ${ this.options.cwd }` );
	}

	prepareTestSite() {
		this.cmd( `npx wp-env run cli wp theme activate hello-elementor` );
		try {
			this.cmd( `npx wp-env run cli "wp --user=admin elementor library import-dir /var/www/html/elementor-templates"` );
		} catch ( error ) {
			this.options.logger.error( error );
		}

		this.cmd( `npx wp-env run cli wp rewrite structure "/%postname%/" --hard` );
		this.cmd( `npx wp-env run cli wp cache flush` );
		this.cmd( `npx wp-env run cli wp rewrite flush --hard` );
		this.cmd( `npx wp-env run cli wp elementor flush-css` );
		this.cmd( `npx wp-env run cli wp post list --post_type=page` );
		this.cmd( `npx wp-env run cli wp option update blogname "elementor"` );
	}
}
