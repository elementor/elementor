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
		this.disableContainers();
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

	disableContainers() {
		console.log( `Disabling containers: ${ process.env.CONTAINERS }` );
		if ( ! process.env.CONTAINERS ) {
			console.log( 'Deactivating containers !!!' );
			this.runWP( `npx wp-env run cli wp elementor experiments deactivate container` );
		}
	}

	runServer() {
		this.cmd( 'npx wp-env start' );
	}

	setCwd() {
		this.cmd( `cd ${ this.options.cwd }` );
	}

	prepareTestSite() {
		this.cmd( 'npm run test:setup' );
	}
}
