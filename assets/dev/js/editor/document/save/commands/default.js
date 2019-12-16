import Base from './base/base';

export class Default extends Base {
	apply( args ) {
		const postStatus = elementor.settings.page.model.get( 'post_status' );

		switch ( postStatus ) {
			case 'publish':
			case 'future':
			case 'private':
				$e.run( 'document/save/update' );

				break;
			case 'draft':
				if ( elementor.config.current_user_can_publish ) {
					$e.run( 'document/save/publish' );
				} else {
					$e.run( 'document/save/pending' );
				}

				break;
			case 'pending': // User cannot change post status
			case undefined: // TODO: as a contributor it's undefined instead of 'pending'.
				if ( elementor.config.current_user_can_publish ) {
					$e.run( 'document/save/publish' );
				} else {
					$e.run( 'document/save/update' );
				}
		}
	}
}

export default Default;
