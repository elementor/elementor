import CommandContainerBase from './command-bases/command-container-base';
import CommandContainerInternalBase from './command-bases/command-container-internal-base';
import CommandHistoryBase from 'elementor-document/command-bases/command-history-base';
import CommandHistoryDebounceBase from 'elementor-document/command-bases/command-history-debounce-base';

$e.modules.editor = {
	CommandContainerBase,
	CommandContainerInternalBase,

	document: {
		CommandHistoryBase,
		CommandHistoryDebounceBase,
	},
};

// TODO: Remove, BC.
$e.modules.document = {
	get CommandHistory() {
		elementorCommon.helpers.softDeprecated(
			'$e.modules.document.CommandHistory',
			'3.7.0',
			'$e.modules.editor.document.CommandHistoryBase'
		);

		return $e.modules.editor.document.CommandHistoryBase;
	},

	get CommandHistoryDebounce() {
		elementorCommon.helpers.softDeprecated(
			'$e.modules.CommandHistoryDebounce',
			'3.7.0',
			'$e.modules.editor.document.CommandHistoryDebounceBase'
		);

		return $e.modules.editor.document.CommandHistoryDebounceBase;
	},
};

