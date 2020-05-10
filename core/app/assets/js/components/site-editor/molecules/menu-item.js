import BaseButton from 'elementor-app/molecules/button';

export default class MenuItem extends BaseButton {
	getCssId() {
		return `elementor-app__site-editor__menu-item-` + super.getCssId();
	}

	getClassName() {
		return `elementor-app__site-editor__menu-item ` + super.getClassName();
	}
}
