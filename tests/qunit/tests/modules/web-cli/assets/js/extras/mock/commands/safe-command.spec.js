export class SafeCommand extends $e.modules.CommandBase {
	static getInfo() {
		return {
			isSafe: true,
			isSafeWithArgs: true,
		};
	}

	apply() {

	}
}
