import Base from './base';

export class Dependency extends Base {
	register() {
		$e.hooks.registerDataDependency( this );
	}
}

export default Dependency;
