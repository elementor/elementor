import Base from './base';

export default class Dependency extends Base {
	register( command, id, callback ) {
		$e.hooks.registerDependency( command, id, callback );
	}
}
