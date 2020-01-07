import Base from './base/base';

export class Publish extends Base {
	apply( args ) {
		let { options = {} } = args;

		options = Object.assign( options, {
			status: 'publish',
			document: this.document,
		} );

		elementor.saver.saveEditor( options );
	}
}
