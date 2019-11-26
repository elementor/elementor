import Base from './base';

export default class Before extends Base {
	register( command, id, callback ) {
		$e.events.registerBefore( command, id, callback );
	}
}
