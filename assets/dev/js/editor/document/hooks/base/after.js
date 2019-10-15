import Base from './base';

export default class After extends Base {
	method() {
		return $e.hooks.registerAfter;
	}
}
