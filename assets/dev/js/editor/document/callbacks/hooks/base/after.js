import Base from './base';

export default class After extends Base {
	register( command, id, callback ) {
		$e.hooks.registerAfter( command, id, callback );
	}
}
