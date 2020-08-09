import CommandBase from './command-base';

export default class Command extends CommandBase {
	static getInstanceType() {
		return 'Command';
	}

	/**
	 * TODO: This method should move to command-editor and should not be part of js-api/core.
	 * Function isDataChanged().
	 *
	 * Whether the editor needs to set change flag on/off.
	 *
	 * @returns {boolean}
	 */
	isDataChanged() {
		return false;
	}
}
