import Base from './base/base';

export class DefaultSave extends Base {
	apply( args ) {
		const postStatus = elementor.settings.page.model.get( 'post_status' );

		switch ( postStatus ) {
			case 'publish':
			case 'future':
			case 'private':
				$e.run( 'document/update' );

				break;
			case 'draft':
				if ( elementor.config.current_user_can_publish ) {
					$e.run( 'document/publish' );
				} else {
					$e.run( 'document/pending' );
				}

				break;
			case 'pending': // User cannot change post status
			case undefined: // TODO: as a contributor it's undefined instead of 'pending'.
				if ( elementor.config.current_user_can_publish ) {
					$e.run( 'document/publish' );
				} else {
					$e.run( 'document/update' );
				}
		}
	}
}
