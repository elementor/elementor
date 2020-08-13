import BaseButton from '../ui/molecules/button';

export default class Button extends BaseButton {
	static defaultProps = Object.assign( {} /* clone */, BaseButton.defaultProps, {
			hideText: true,
	} );

	getCssId() {
		return `eps-app-header-btn-` + super.getCssId();
	}

	getClassName() {
		return `eps-app__header-btn ` + super.getClassName();
	}
}
