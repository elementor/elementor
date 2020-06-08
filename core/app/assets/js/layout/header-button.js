import BaseButton from '../ui/molecules/button';

export default class Button extends BaseButton {
	static defaultProps = Object.assign( {} /* clone */, BaseButton.defaultProps, {
			hideText: true,
	} );

	getCssId() {
		return `elementor-template-library-header-` + super.getCssId();
	}

	getClassName() {
		return `elementor-templates-modal__header__item ` + super.getClassName();
	}
}
