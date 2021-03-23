import CommandInternal from 'elementor-api/modules/command-internal';

export class SetIsModified extends CommandInternal {
	validateArgs( args ) {
		this.requireArgumentType( 'status', 'boolean', args );
	}

	apply( args ) {
		const { status, document = elementor.documents.getCurrent() } = args;

		// Save document for hooks.
		args.document = document;

		document.editor.isChanged = status;

		if ( status && document.editor.isSaving ) {
			document.editor.isChangedDuringSave = true;
		}

		if ( status ) {
			document.editor.isSaved = false;
		}

		// TODO: BC.
		elementor.channels.editor
			.reply( 'status', status )
			.trigger( 'status:change', status );

		if ( document.editor.isChanged ) {
			this.component.startAutoSave( document );
		}
	}
}

export default SetIsModified;
