import Document from '../../document';

export class Unload extends $e.modules.CommandInternalBase {
	validateArgs( args = {} ) {
		this.requireArgumentConstructor( 'document', Document, args );
	}

	apply( args ) {
		return new Promise( ( resolve, reject ) => {
			const { document } = args;

			if ( document.id !== elementor.config.document.id ) {
				reject();
			}

			elementor.elements = [];

			elementor.saver.stopAutoSave( document );

			elementor.channels.dataEditMode.trigger( 'switch', 'preview' );

			if ( document.$element ) {
				document.$element
					.removeClass( 'elementor-edit-area-active elementor-edit-mode' )
					.addClass( 'elementor-editor-preview' );
			}

			elementorCommon.elements.$body.removeClass( `elementor-editor-${ document.config.type }` );

			elementor.settings.page.destroy();

			elementor.heartbeat.destroy();

			document.editor.status = 'closed';

			elementor.config.document = {};

			elementor.documents.unsetCurrent();

			elementor.trigger( 'document:unloaded', document );

			resolve();
		} );
	}
}

export default Unload;
