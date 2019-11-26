import Base from './base';

export default class After extends Base {
	register( command, id, callback ) {
		$e.events.registerAfter( command, id, callback );
	}
}
