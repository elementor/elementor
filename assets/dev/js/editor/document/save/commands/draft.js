import Base from './base/base';

export class Draft extends Base {
	apply() {
		const postStatus = elementor.settings.page.model.get( 'post_status' );

		if ( ! this.component.isEditorChanged() && 'draft' !== postStatus ) {
			return jQuery.Deferred().reject();
		}

		const document = this.document;

		let deferred;

		switch ( postStatus ) {
			case 'publish':
			case 'private':
				deferred = $e.run( 'document/save/auto', { document } );
				break;
			default:
				// Update and create a revision
				deferred = $e.run( 'document/save/update', { document } );
		}

		return deferred;
	}
}

export default Draft;
