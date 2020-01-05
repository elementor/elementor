import DataBase from './base';

export default class DataAfter extends DataBase {
	register() {
		$e.hooks.registerDataAfter( this );
	}
}
