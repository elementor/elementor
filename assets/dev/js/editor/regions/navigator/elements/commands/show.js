import CommandNavigatorVisibility from './base/command-navigator-visibility';

export class Show extends CommandNavigatorVisibility {
	getVisibility() {
		return false;
	}
}

export default Show;
