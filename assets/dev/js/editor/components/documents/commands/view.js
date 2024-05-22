export class View extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	async apply( args ) {
		const { id } = args,
			document = elementor.documents.get( id );

		// Open immediately in order to avoid popup blockers.
		open( document.config.urls.permalink, `wp-view-${ document.id }` );
	}
}

export default View;
