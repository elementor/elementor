import Base from './base/base';

export class Default extends Base {
	apply() {
		const document = this.document,
			postStatus = document.container.settings.get( 'post_status' );

		let deferred;

		switch ( postStatus ) {
			case 'publish':
			case 'future':
			case 'private':
				deferred = $e.run( 'document/save/update', this.args );

				break;
			case 'draft':
				if ( document.config.user.can_publish ) {
					deferred = $e.run( 'document/save/publish', this.args );
				} else {
					deferred = $e.run( 'document/save/pending', this.args );
				}

				break;
			case 'pending': // User cannot change post status
			case undefined: // TODO: as a contributor it's undefined instead of 'pending'.
				if ( document.config.user.can_publish ) {
					deferred = $e.run( 'document/save/publish', this.args );
				} else {
					deferred = $e.run( 'document/save/update', this.args );
				}
		}

		return deferred;
	}
}

export default Default;
