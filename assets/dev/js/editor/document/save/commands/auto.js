import Base from '../../commands/base/base';

export class Auto extends Base {
	apply( args ) {
		const { force = false, options = {} } = args;

		if ( ! force && 'edit' !== elementor.channels.dataEditMode.request( 'activeMode' ) ) {
			return;
		}

		this.save( options );
	}

	save( options ) {
		if ( this.component.isEditorChanged() ) {
			// TODO: Move to es6.
			options = _.extend( {
				status: 'autosave',
			}, options );

			$e.run( 'document/save/save', options );
		}
	}
}

export default Auto;
