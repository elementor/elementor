import Base from './base/base';

export class SetIsModified extends Base {
	validateArgs( args ) {
		this.requireArgumentType( 'status', 'boolean', args );
	}

	apply( args ) {
		const { status } = args;

		if ( status && this.component.isSaving ) {
			this.component.isChangedDuringSave = true;
		}

		this.component.startTimer( status );

		elementor.channels.editor
			.reply( 'status', status )
			.trigger( 'status:change', status );
	}
}

export default SetIsModified;
