import UIBase from './base';

export default class UIAfter extends UIBase {
	register() {
		$e.hooks.registerUIAfter( this );
	}
}
