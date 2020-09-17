import CommandDisableEnable from 'elementor-document/commands/base/command-disable-enable';

export default class DisableEnable extends CommandDisableEnable {
	static getEnableCommand() {
		return 'document/globals/enable';
	}

	static getDisableCommand() {
		return 'document/globals/disable';
	}

	getTitle() {
		return __( 'Globals', 'elementor' );
	}
}
