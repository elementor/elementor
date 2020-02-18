import Base from './base/base';

export class Draft extends Base {
	apply() {
		const document = this.document,
			postStatus = document.container.settings.get( 'post_status' );

		// If no changes - don't save but allow un-publish.
		if ( ! document.editor.isChanged && 'draft' !== postStatus ) {
			return jQuery.Deferred().reject( 'Document is not editable' );
		}

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
