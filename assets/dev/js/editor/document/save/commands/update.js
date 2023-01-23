import Base from './base/base';

export class Update extends Base {
	apply( args ) {
		const {
			document = this.document,
			status = document.container.settings.get( 'post_status' ),
		} = args;

		return $e.internal( 'document/save/save', {
			status,
			document,
		} );
	}
}
