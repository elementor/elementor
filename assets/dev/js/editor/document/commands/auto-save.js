import Base from './base/base';

export class AutoSave extends Base {
	apply( args ) {
		const { mode = '', options = {} } = args;

		if ( 'safe' === mode ) {
			this.safeSave();
		} else {
			this.save( options );
		}
	}

	safeSave() {
		const editorMode = elementor.channels.dataEditMode.request( 'activeMode' );

		// Avoid auto save for revisions preview changes.
		if ( 'edit' !== editorMode ) {
			return;
		}

		this.save();
	}

	save( options ) {
		if ( elementor.saver.isEditorChanged() ) {
			// TODO: Move to es6.
			options = _.extend( {
				status: 'autosave',
			}, options );

			elementor.saver.saveEditor( options );
		}
	}
}

export default AutoSave;
