import CommandNavigatorShowHide from './base/command-navigator-show-hide';

export class Show extends CommandNavigatorShowHide {
	shouldHide() {
		return false;
	}
}

export default Show;
