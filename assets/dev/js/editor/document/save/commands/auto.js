import Base from './base/base';

export class Auto extends Base {
	apply( args ) {
		const { status = 'autosave', force = false, document = this.document } = args;

		if ( ! force && 'edit' !== elementor.channels.dataEditMode.request( 'activeMode' ) ) {
			return jQuery.Deferred().reject();
		}

		if ( ! this.component.isEditorChanged() ) {
			return jQuery.Deferred().reject();
		}

		return $e.internal( 'document/save/save', {
			status,
			document,
		} );
	}
}

export default Auto;
