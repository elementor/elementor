import Base from '../../commands/base/base';

// Consider SetSaver instead of Saver
export class Saver extends Base {
	validateArgs( args ) {
		this.requireArgumentType( 'status', 'boolean', args );
	}

	apply( args ) {
		const { status } = args;

		if ( status && elementor.saver.isSaving ) {
			elementor.saver.isChangedDuringSave = true;
		}

		elementor.saver.startTimer( status );

		elementor.channels.editor
			.reply( 'status', status )
			.trigger( 'status:change', status );
	}
}

export default Saver;
