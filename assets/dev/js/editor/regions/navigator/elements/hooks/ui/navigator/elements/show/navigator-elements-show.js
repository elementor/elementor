import BaseHideShow from '../../../base/base-hide-show';

export class NavigatorElementsShow extends BaseHideShow {
	getCommand() {
		return 'navigator/elements/show';
	}

	getId() {
		return 'navigator-elements-show';
	}

	shouldHide() {
		return false;
	}
}

export default NavigatorElementsShow;
