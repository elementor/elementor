import Base from '../../commands/base/base';

export class Publish extends Base {
	apply( args ) {
		let { options = {} } = args;

		// TODO: Move to es6.
		options = _.extend( {
			status: 'publish',
		}, options );

		elementor.saver.saveEditor( options );
	}
}
