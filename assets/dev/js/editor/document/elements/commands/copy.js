import CommandEditorBase from 'elementor-editor/base/command-editor-base';

export class Copy extends CommandEditorBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { storageKey = 'clipboard', containers = [ args.container ] } = args;

		elementorCommon.storage.set(
			storageKey,
			containers.map( ( container ) => container.model.toJSON( { copyHtmlCache: true } ) )
		);
	}

	isDataChanged() {
		return false;
	}
}

export default Copy;
