export class PasteInteractions extends $e.modules.editor.CommandContainerBase {
	validateArgs( args ) {
		this.requireContainer( args );

		const { storageKey = 'clipboard' } = args;
		const storageData = elementorCommon.storage.get( storageKey );

		this.requireArgumentType( 'storageData', 'object', { storageData } );
	}

	apply() {
	}
}

export default PasteInteractions;
