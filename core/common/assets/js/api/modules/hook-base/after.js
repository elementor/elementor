import HookBase from './base';

export default class HookAfter extends HookBase {
	register() {
		$e.hooks.registerAfter( this );
	}
}
