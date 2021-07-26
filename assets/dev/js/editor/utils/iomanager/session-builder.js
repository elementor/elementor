import Normalizer from './normalizer';
import Session from './session';
import Target from './target';

export default class SessionBuilder {
	constructor( files = null, target = null, options = {} ) {
		this.sessionHandler = Promise.resolve(
			new Session( files, target, options )
		);
	}

	static createSession( files = null, target = null, options = {} ) {
		return new this( files, target, options );
	}

	normalizeInput( input ) {
		Normalizer.normalize( input )
			.then( ( files ) => {
				return this.setFiles( files );
			} );

		return this;
	}

	setFiles( files ) {
		this.getSessionHandler().then( ( session ) => {
			session.setFileList( files );
		} );

		return this;
	}

	setContainer( container ) {
		return this.setTarget( new Target( container ) );
	}

	setTarget( target ) {
		this.getSessionHandler().then( ( session ) => {
			session.setTarget( target );
		} );

		return this;
	}

	getSessionHandler() {
		return this.sessionHandler;
	}
}
