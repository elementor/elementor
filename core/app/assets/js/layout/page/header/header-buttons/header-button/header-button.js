import BaseButton from '../../../../../molecules/button';
import './header-button.scss';

export default class Button extends BaseButton {
	static defaultProps = Object.assign( {} /* clone */, BaseButton.defaultProps, {
			hideText: true,
	} );

	getCssId() {
		return `e-app__view__header__buttons__button-` + super.getCssId();
	}

	getClassName() {
		return `e-app__view__header__buttons__button ` + super.getClassName();
	}
}
