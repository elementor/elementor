import BaseGlobalsUpdate from '../base-globals-update';

export class KitGlobalsUpdateColors extends BaseGlobalsUpdate {
	getCommand() {
		return 'globals/colors/create';
	}

	getId() {
		return 'globals-update-colors-/globals/colors/create';
	}

	getRepeaterName() {
		return 'custom_colors';
	}

	applyModel( model, value ) {
		model.color = value;
	}
}
export default KitGlobalsUpdateColors;
