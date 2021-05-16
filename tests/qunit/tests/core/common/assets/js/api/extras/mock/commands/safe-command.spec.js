import Command from 'elementor-api/modules/command';

export class SafeCommand extends Command {
	static getInfo() {
		return {
			isSafe: true,
		};
	}
}
