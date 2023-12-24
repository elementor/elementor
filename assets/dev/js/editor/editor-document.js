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
	/**
	 * @deprecated since 3.7.0, use `$e.modules.editor.document.CommandHistoryBase` instead.
	 */
	get CommandHistory() {
		elementorDevTools.deprecation.deprecated(
			'$e.modules.document.CommandHistory',
			'3.7.0',
			'$e.modules.editor.document.CommandHistoryBase',
		);

		return $e.modules.editor.document.CommandHistoryBase;
	},

	/**
	 * @deprecated since 3.7.0, use `$e.modules.editor.document.CommandHistoryDebounceBase` instead.
	 */
	get CommandHistoryDebounce() {
		elementorDevTools.deprecation.deprecated(
			'$e.modules.CommandHistoryDebounce',
			'3.7.0',
			'$e.modules.editor.document.CommandHistoryDebounceBase',
		);

		return $e.modules.editor.document.CommandHistoryDebounceBase;
	},
};

