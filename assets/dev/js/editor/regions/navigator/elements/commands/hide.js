import CommandNavigatorShowHide from './base/command-navigator-show-hide';

export class Hide extends CommandNavigatorShowHide {
	shouldHide() {
		return true;
	}
}

export default Hide;
