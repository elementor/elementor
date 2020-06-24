import Base from './base';

export class Catch extends Base {
	register() {
		$e.hooks.registerUICatch( this );
	}
}

export default Catch;
