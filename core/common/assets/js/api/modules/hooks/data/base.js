import HookBase from 'elementor-api/modules/hook-base';

export class Base extends HookBase {
	getType() {
		return 'data';
	}

	getInternalConditions() {
		return elementor.documents.getCurrent().history.getActive();
	}
}

export default Base;
