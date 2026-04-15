import Base from './base/base';

export class Default extends Base {
	apply() {
		const document = this.document;

		// container.settings may hold a v4 atomic prop { $$type, value } when the
		// document was edited via the atomic (v4) panel. Unwrap it so the switch
		// below receives the plain string that all v3 save commands expect.
		let rawStatus = document.container.settings.get( 'post_status' );
		const postStatus = ( rawStatus && typeof rawStatus === 'object' && '$$type' in rawStatus )
			? rawStatus.value
			: rawStatus;

		let deferred;

		switch ( postStatus ) {
			case 'publish':
			case 'future':
			case 'private':
				deferred = $e.run( 'document/save/update', { document } );

				break;
			case 'draft':
				if ( document.config.user.can_publish ) {
					deferred = $e.run( 'document/save/publish', { document } );
				} else {
					deferred = $e.run( 'document/save/pending', { document } );
				}

				break;
			case 'pending': // User cannot change post status
			case undefined: // TODO: as a contributor it's undefined instead of 'pending'.
				if ( document.config.user.can_publish ) {
					deferred = $e.run( 'document/save/publish', { document } );
				} else {
					deferred = $e.run( 'document/save/update', { document } );
				}
		}

		return deferred;
	}
}

export default Default;
