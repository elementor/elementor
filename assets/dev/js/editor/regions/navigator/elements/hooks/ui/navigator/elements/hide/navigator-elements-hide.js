import BaseHideShow from '../../../base/base-hide-show';

export class NavigatorElementsHide extends BaseHideShow {
	getCommand() {
		return 'navigator/elements/hide';
	}

	getId() {
		return 'navigator-elements-hide';
	}

	shouldHide() {
		return true;
	}
}

export default NavigatorElementsHide;
