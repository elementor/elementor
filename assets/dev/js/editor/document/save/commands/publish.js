import Base from './base/base';

export class Publish extends Base {
	apply( args ) {
		const { status = 'publish', document = this.document } = args;

		return $e.internal( 'document/save/save', {
			status,
			document,
		} );
	}
}
