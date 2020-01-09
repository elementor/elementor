import Base from './base/base';

export class Pending extends Base {
	apply( args ) {
		let { options } = args;

		options = Object.assign( options, {
			status: 'pending',
			document: this.document,
		} );

		elementor.saver.saveEditor( options );
	}
}

