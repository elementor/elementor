import Base from './base';

export class Before extends Base {
	register() {
		$e.hooks.registerUIBefore( this );
	}
}

export default Before;
