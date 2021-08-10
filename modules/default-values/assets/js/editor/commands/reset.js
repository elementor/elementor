import Base from './base';

export class Reset extends Base {
	validateArgs( args ) {
		this.requireArgument( 'type', args );
	}

	async apply( { type } ) {
		await $e.data.delete( 'default-values/index', { type } );

		this.recreateElements( type );
	}
}

export default Reset;
