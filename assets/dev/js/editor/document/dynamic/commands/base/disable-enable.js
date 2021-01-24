import CommandDisableEnable from 'elementor-document/commands/base/command-disable-enable';

export default class DisableEnable extends CommandDisableEnable {
	static getEnableCommand() {
		return 'document/dynamic/enable';
	}

	static getDisableCommand() {
		return 'document/dynamic/disable';
	}

	getTitle() {
		return __( 'Dynamic' );
	}
}
