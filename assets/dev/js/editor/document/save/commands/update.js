import Base from './base/base';

export class Update extends Base {
	apply( args ) {
		const { document = this.document } = args;

		// Unwrap v4 atomic prop if post_status is stored as { $$type, value }.
		let rawStatus = document.container.settings.get( 'post_status' );
		if ( rawStatus && typeof rawStatus === 'object' && '$$type' in rawStatus ) {
			rawStatus = rawStatus.value;
		}

		const { status = rawStatus } = args;

		return $e.internal( 'document/save/save', {
			status,
			document,
		} );
	}
}
