import Base from './base';

export default class Before extends Base {
	method() {
		return $e.events.registerBefore;
	}
}
