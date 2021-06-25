import CommandEditorBase from './command-editor-base';

export default class CommandEditorInternal extends CommandEditorBase {
	static getInstanceType() {
		return 'CommandEditorInternal';
	}

	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}

	isDataChanged() {
		/**
		 * The problem comes when CommandEditorInternal should have part of 'CommandEditorBase' logic and part of 'CommandInteralBase' logic.
		 * Since 'CommandEditorInternal' does not implement CommandInternalBase.
		 * But uses 'commandsAPI` variable for it.
		 * And this class is 'CommandEditorInternal' which internal it does not have isDataChanged logic.
		 */
		return false;
	}
}
