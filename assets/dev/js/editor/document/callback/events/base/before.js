import Base from './base';

export default class Before extends Base {
	register() {
		$e.events.registerBefore( this );
	}
}
