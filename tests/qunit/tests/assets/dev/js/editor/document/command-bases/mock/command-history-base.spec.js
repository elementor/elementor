import CommandHistoryBase from 'elementor-editor/document/command-bases/command-history-base';

export default class CommandHistoryBaseMock extends CommandHistoryBase {}
export class CommandHistoryBaseExportedMock extends $e.modules.editor.document.CommandHistoryBase {}

function getHistory( args ) {
	const { bypassHistory = false } = args;

	if ( bypassHistory ) {
		return;
	}

	return CommandHistoryBase.prototype.getHistory.call( this, args );
}

CommandHistoryBaseMock.registerConfig = {};
CommandHistoryBaseExportedMock.registerConfig = {};
CommandHistoryBaseMock.prototype.getHistory = getHistory;
CommandHistoryBaseExportedMock.prototype.getHistory = getHistory;
