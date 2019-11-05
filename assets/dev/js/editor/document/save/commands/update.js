import Base from '../../commands/base/base';

export class Update extends Base {
	apply( args ) {
		let { options = {} } = args;

		// TODO: Move to es6.
		options = _.extend( {
			status: elementor.settings.page.model.get( 'post_status' ),
		}, options );

		elementor.saver.saveEditor( options );
	}
}
