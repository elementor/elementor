import Base from './base/base';

export class Auto extends Base {
	apply( args ) {
		const { force = false } = args;
		let { options } = args;

		if ( ! force && 'edit' !== elementor.channels.dataEditMode.request( 'activeMode' ) ) {
			return jQuery.Deferred().reject();
		}

		if ( ! this.component.isEditorChanged() ) {
			return jQuery.Deferred().reject();
		}

		options = Object.assign( {
			status: 'autosave',
			document: this.document,
		}, options );

		return $e.internal( 'document/save/save', { options } );
	}
}

export default Auto;
