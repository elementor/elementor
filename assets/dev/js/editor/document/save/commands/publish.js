import Base from './base/base';

export class Publish extends Base {
	apply( args ) {
		let { options = {} } = args;

		options = Object.assign( {
			status: 'publish',
			document: this.document,
		}, options );

		return $e.internal( 'document/save/save', { options } );
	}
}
