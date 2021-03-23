import CommandEditor from './base/command-editor';
import CommandEditorInternal from './base/command-editor-internal';
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
	CommandEditor,
	CommandEditorInternal,

	document: DocumentComponent.getModules(),
};

// TODO: Remove, BC.
$e.modules.document = {
	get CommandHistory() {
		elementorCommon.helpers.hardDeprecated(
			'$e.modules.document.CommandHistory',
			'3.0.0',
			'$e.modules.editor.document.CommandHistory'
		);

		return $e.modules.editor.document.CommandHistory;
	},

	get CommandHistoryDebounce() {
		elementorCommon.helpers.hardDeprecated(
			'$e.modules.CommandHistoryDebounce',
			'3.0.0',
			'$e.modules.editor.document.CommandHistoryDebounce'
		);

		return $e.modules.editor.document.CommandHistoryDebounce;
	},
};

