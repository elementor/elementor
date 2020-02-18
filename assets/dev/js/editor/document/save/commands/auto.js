import Base from './base/base';

export class Auto extends Base {
	apply( args ) {
		const { force = false, document = this.document } = args;

		if ( ! force && ! document.container.isEditable() ) {
			return jQuery.Deferred().reject( 'Document is not editable' );
		}

		if ( ! document.editor.isChanged ) {
			return jQuery.Deferred().resolve( 'Document is not changed' );
		}

		args.status = 'autosave';
		args.document = document;

		return $e.internal( 'document/save/save', args );
	}
}

export default Auto;
