import './menu-item.scss';
import BaseButton from '../molecules/button';

export default class SideMenuItem extends BaseButton {
	getCssId() {
		return `e-app-menu-item-` + super.getCssId();
	}

	getClassName() {
		return `e-app-menu-item ` + super.getClassName();
	}
}
