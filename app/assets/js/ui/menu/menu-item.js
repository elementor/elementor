import './menu-item.scss';
import BaseButton from '../molecules/button';

export default class SideMenuItem extends BaseButton {
	getCssId() {
		return `eps-menu-item-` + super.getCssId();
	}

	getClassName() {
		return `eps-menu-item ` + super.getClassName();
	}
}
