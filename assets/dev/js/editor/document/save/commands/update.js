import Base from './base/base';

export class Update extends Base {
	apply( args ) {
		let { options = {} } = args;

		options = Object.assign( {
			status: elementor.settings.page.model.get( 'post_status' ),
			document: this.document,
		}, options );

		return elementor.saver.saveEditor( options );
	}
}
