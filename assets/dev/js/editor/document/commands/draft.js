import Base from './base/base';

export class Draft extends Base {
	apply() {
		const postStatus = elementor.settings.page.model.get( 'post_status' );

		if ( ! elementor.saver.isEditorChanged() && 'draft' !== postStatus ) {
			return;
		}

		switch ( postStatus ) {
			case 'publish':
			case 'private':
				$e.run( 'document/auto-save', { mode: 'safe' } );
				break;
			default:
				// Update and create a revision
				$e.run( 'document/update' );
		}
	}
}

export default Draft;
