import CallableBase from 'elementor-api/modules/callable-base';

export default class HookBase extends CallableBase {
	getType() {
		return 'hook';
	}
}
