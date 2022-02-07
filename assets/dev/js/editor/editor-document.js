import CommandContainerBase from './command-bases/command-container-base';
import CommandContainerInternalBase from './command-bases/command-container-internal-base';
import DocumentComponent from './document/component';
import DataGlobalsComponent from './data/globals/component';

elementorCommon.elements.$window.on( 'elementor:init-components', () => {
	// TODO: Move to elementor:init-data-components
	$e.components.register( new DataGlobalsComponent() );

	$e.components.register( new DocumentComponent() );

	// TODO: Remove, BC Since 2.9.0.
	elementor.saver = $e.components.get( 'document/save' );
} );

$e.modules.editor = {
	CommandContainerBase,
	CommandContainerInternalBase,

	document: DocumentComponent.getModules(),
};

// TODO: Remove, BC.
$e.modules.document = {
	get CommandHistory() {
		elementorCommon.helpers.softDeprecated(
			'$e.modules.document.CommandHistory',
			'3.5.0',
			'$e.modules.editor.document.CommandHistoryBase'
		);

		return $e.modules.editor.document.CommandHistoryBase;
	},

	get CommandHistoryDebounce() {
		elementorCommon.helpers.softDeprecated(
			'$e.modules.CommandHistoryDebounce',
			'3.5.0',
			'$e.modules.editor.document.CommandHistoryDebounceBase'
		);

		return $e.modules.editor.document.CommandHistoryDebounceBase;
	},
};

