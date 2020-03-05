import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class CloseForce extends CommandInternalBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	async apply( args ) {
		const { id, mode, onClose } = args,
			document = elementor.documents.get( id );

		switch ( mode ) {
			case 'autosave':
				await $e.run( 'document/save/auto' );
				break;
			case 'save':
				await $e.run( 'document/save/update' );
				break;
			case 'discard':
				await $e.run( 'document/save/discard', { document } );
				break;
		}

		elementor.unloadDocument( document );

		if ( onClose ) {
			await onClose( document );
		}

		return jQuery.Deferred().resolve();
	}
}

export default CloseForce;
