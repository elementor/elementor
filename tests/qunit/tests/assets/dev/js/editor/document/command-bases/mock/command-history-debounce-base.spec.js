import CommandHistoryDebounceBase from 'elementor-editor/document/command-bases/command-history-debounce-base';

export default class CommandHistoryDebounceBaseMock extends CommandHistoryDebounceBase {}
export class CommandHistoryDebounceBaseExportedMock extends $e.modules.editor.document.CommandHistoryDebounceBase {}

function getHistory( args ) {
	const { bypassHistory = false } = args;

	if ( bypassHistory ) {
		return;
	}

	return CommandHistoryDebounceBase.prototype.getHistory.call( this, args );
}

CommandHistoryDebounceBaseMock.registerConfig = {};
CommandHistoryDebounceBaseExportedMock.registerConfig = {};
CommandHistoryDebounceBaseMock.prototype.getHistory = getHistory;
CommandHistoryDebounceBaseExportedMock.prototype.getHistory = getHistory;
