import Base from './base';

export default class After extends Base {
	register() {
		$e.events.registerAfter( this );
	}
}
