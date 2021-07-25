import Normalizer from './normalizer';
import Session from './session';

export default class SessionFactory {
	static createSession( input, container, options = {} ) {
		return Normalizer.normalize( input ).then( ( files ) => {
			return new Session(
				files,
				container,
				options
			);
		} );
	}
}
