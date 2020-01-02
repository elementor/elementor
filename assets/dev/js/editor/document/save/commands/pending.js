import Base from './base/base';

export class Pending extends Base {
	apply( args ) {
		let { options } = args;

		// TODO: Move to es6.
		options = _.extend( {
			status: 'pending',
			document: this.document,
		}, options );

		elementor.saver.saveEditor( options );
	}
}

