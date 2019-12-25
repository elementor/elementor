import Base from './base';

export default class HookDependency extends Base {
	register() {
		$e.hooks.registerDependency( this );
	}
}
