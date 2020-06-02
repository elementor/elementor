import BaseButton from 'elementor-app/molecules/button';
import './menu-item.scss';

export default class MenuItem extends BaseButton {
	getCssId() {
		return `e-app__site-editor__menu-item-` + super.getCssId();
	}

	getClassName() {
		return `e-app__site-editor__menu-item ` + super.getClassName();
	}
}
