import Base from './base';

/**
 * @name $e.modules.hookUI.After
 */
export class After extends Base {
	register() {
		$e.hooks.registerUIAfter( this );
	}
}

export default After;
