import Base from './base';

export default class Dependency extends Base {
	method() {
		return $e.hooks.registerDependency;
	}
}
