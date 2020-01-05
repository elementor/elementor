import DataBase from './base';

export default class DataDependency extends DataBase {
	register() {
		$e.hooks.registerDataDependency( this );
	}
}
