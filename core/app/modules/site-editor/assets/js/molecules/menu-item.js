import BaseButton from 'elementor-app/ui/molecules/button';
import './menu-item.scss';

export default class MenuItem extends BaseButton {
	getCssId() {
		return `elementor-app__site-editor__menu-item-` + super.getCssId();
	}

	getClassName() {
		return `elementor-app__site-editor__menu-item ` + super.getClassName();
	}
}
