import Session from './session';
import Target from './target';

export default class SessionBuilder {
	/**
	 * SessionBuilder constructor.
	 *
	 * @param manager
	 * @param files
	 * @param target
	 * @param options
	 */
	constructor( manager, files = null, target = null, options = {} ) {
		this.manager = manager;
		this.handler = Promise.resolve();

		this.session = new Session( manager, files, target, options );
	}

	/**
	 * Normalize the input and set it to the session.
	 *
	 * @param input
	 * @returns {SessionBuilder}
	 */
	normalizeInput( input ) {
		return this.stage(
			() => this.manager.getNormalizer().normalize( input )
			.then( ( files ) => this.setFiles( files ) )
		);
	}

	/**
	 * Set the session FileList.
	 *
	 * @param files
	 * @returns {SessionBuilder}
	 */
	setFiles( files ) {
		return this.stage( () => this.session.setFileList( files ) );
	}

	/**
	 * Set a Container as the session Target object.
	 *
	 * @param container
	 * @param options
	 * @returns {SessionBuilder}
	 */
	setContainer( container, options = {} ) {
		return this.setTarget( new Target( container, options ) );
	}

	/**
	 * Set the session Target object.
	 *
	 * @param target
	 * @returns {SessionBuilder}
	 */
	setTarget( target ) {
		return this.stage( () => this.session.setTarget( target ) );
	}

	/**
	 * Set the session options.
	 *
	 * @param options
	 * @returns {SessionBuilder}
	 */
	setOptions( options ) {
		return this.stage( () => this.session.setOptions( options ) );
	}

	/**
	 * Concatenate a callback to the builder promise.
	 *
	 * @param callback
	 * @returns {SessionBuilder}
	 */
	stage( callback ) {
		this.handler = this.handler.then( callback );

		return this;
	}

	/**
	 * Return the built session inside a Promise.
	 *
	 * @returns {Promise<Session>}
	 */
	build() {
		return this.handler.then( () => this.session );
	}
}
