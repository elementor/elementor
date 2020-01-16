import Base from './base/base';

export class Update extends Base {
	apply( args ) {
		const {
			status = elementor.settings.page.model.get( 'post_status' ),
			document = this.document,
		} = args;

		return $e.internal( 'document/save/save', {
			status,
			document,
		} );
	}
}
