import Base from './base/base';

export class Draft extends Base {
	apply() {
		const postStatus = elementor.settings.page.model.get( 'post_status' );

		if ( ! this.component.isEditorChanged() && 'draft' !== postStatus ) {
			return;
		}

		const document = this.document;

		switch ( postStatus ) {
			case 'publish':
			case 'private':
				$e.run( 'document/save/auto', { document } );
				break;
			default:
				// Update and create a revision
				$e.run( 'document/save/update', { document } );
		}
	}
}

export default Draft;
