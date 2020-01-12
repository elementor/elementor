import Base from './base/base';

export class Pending extends Base {
	apply( args ) {
		let { options } = args;

		options = Object.assign( {
			status: 'pending',
			document: this.document,
		}, options );

		elementor.saver.saveEditor( options );
	}
}

