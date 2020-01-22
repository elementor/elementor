import Base from './base';

export class Catch extends Base {
	register() {
		$e.hooks.registerDataCatch( this );
	}
}

export default Catch;
