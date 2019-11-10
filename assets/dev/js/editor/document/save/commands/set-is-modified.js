import Base from '../../commands/base/base';

export class SetIsModified extends Base {
	validateArgs( status ) {
		this.requireArgumentType( 'status', 'boolean', { status } );
	}

	apply( status ) {
		if ( status && elementor.saver.isSaving ) {
			elementor.saver.isChangedDuringSave = true;
		}

		elementor.saver.startTimer( status );

		elementor.channels.editor
			.reply( 'status', status )
			.trigger( 'status:change', status );
	}
}

export default SetIsModified;
