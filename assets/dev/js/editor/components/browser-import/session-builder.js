import Session from './session';
import Target from './target';

export default class SessionBuilder {
	constructor( manager, files = null, target = null, options = {} ) {
		this.manager = manager;
		this.handler = Promise.resolve();

		this.session = new Session( manager, files, target, options );
	}

	normalizeInput( input ) {
		return this.stage(
			() => this.manager.getNormalizer().normalize( input )
			.then( ( files ) => this.setFiles( files ) )
		);
	}

	setFiles( files ) {
		return this.stage( () => this.session.setFileList( files ) );
	}

	setContainer( container, options = {} ) {
		return this.setTarget( new Target( container, options ) );
	}

	setTarget( target ) {
		return this.stage( () => this.session.setTarget( target ) );
	}

	setOptions( options ) {
		return this.stage( () => this.session.setOptions( options ) );
	}

	stage( callback ) {
		this.handler = this.handler.then( callback );

		return this;
	}

	build() {
		return this.handler.then( () => this.session );
	}
}
