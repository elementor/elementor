import StateBase from 'elementor-api/core/states-tmp/state-base';

export class Elements extends StateBase {
	apply() {
		return elementor.elementsModel;
	}
}

export default Elements;
