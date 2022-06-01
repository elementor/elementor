import Base from './base';

/**
 * @name $e.modules.hookData.Dependency
 */
export class Dependency extends Base {
	register() {
		$e.hooks.registerDataDependency( this );
	}
}

export default Dependency;
