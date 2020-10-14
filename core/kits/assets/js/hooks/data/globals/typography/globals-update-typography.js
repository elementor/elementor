import BaseGlobalsUpdate from '../base-globals-update';

export class KitGlobalsUpdateTypography extends BaseGlobalsUpdate {
	getCommand() {
		return 'globals/typography/create';
	}

	getId() {
		return 'globals-update-typography-/globals/typography/create';
	}

	getRepeaterName() {
		return 'custom_typography';
	}

	applyModel( model, value ) {
		Object.assign( model, value );
	}
}
export default KitGlobalsUpdateTypography;
