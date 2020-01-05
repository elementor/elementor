import UIBase from './base';

export default class UIBefore extends UIBase {
	register() {
		$e.hooks.registerUIBefore( this );
	}
}
