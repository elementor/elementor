import BaseButton from '../molecules/button';

export default class SideMenuItem extends BaseButton {
	getCssId() {
		return `e-app__menu-item-` + super.getCssId();
	}

	getClassName() {
		return `e-app__menu-item ` + super.getClassName();
	}
}
