import CommandNavigatorVisibility from './base/command-navigator-visibility';

export class Hide extends CommandNavigatorVisibility {
	getVisibility() {
		return true;
	}
}

export default Hide;
