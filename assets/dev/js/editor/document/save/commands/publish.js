import Base from './base/base';

export class Publish extends Base {
	apply( args ) {
		let { options = {} } = args;

		// TODO: Move to es6.
		options = _.extend( {
			status: 'publish',
		}, options );

		$e.run( 'document/save/save', options );
	}
}
