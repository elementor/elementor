import Base from './base';

export class Reset extends Base {
	validateArgs( args ) {
		this.requireArgumentType( 'type', 'string', args );
	}

	async apply( { type } ) {
		this.showLoader();

		await $e.data.delete( 'default-values/index', { type } );

		await this.recreateElements( type );

		this.hideLoader();
	}
}

export default Reset;
