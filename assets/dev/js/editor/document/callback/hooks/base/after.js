import Base from './base';

export default class After extends Base {
	register() {
		$e.hooks.registerAfter( this );
	}
}
