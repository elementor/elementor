import CommandBase from 'elementor-api/modules/command-base';

export class SafeCommand extends CommandBase {
	static getInfo() {
		return {
			isSafe: true,
		};
	}
}
