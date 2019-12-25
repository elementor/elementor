import HookBase from './base';

export default class HookDependency extends HookBase {
	register() {
		$e.hooks.registerDependency( this );
	}
}
