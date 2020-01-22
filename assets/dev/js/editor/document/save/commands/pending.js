import Base from './base/base';

export class Pending extends Base {
	apply( args ) {
		const { status = 'pending', document = this.document } = args;

		return $e.internal( 'document/save/save', {
			status,
			document,
		} );
	}
}

