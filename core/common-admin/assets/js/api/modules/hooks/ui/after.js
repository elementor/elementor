import Base from './base';

export class After extends Base {
	register() {
		$e.hooks.registerUIAfter( this );
	}
}

export default After;
