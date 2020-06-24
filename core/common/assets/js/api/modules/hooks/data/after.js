import Base from './base';

export class After extends Base {
	register() {
		$e.hooks.registerDataAfter( this );
	}
}

export default After;
