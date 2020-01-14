import BackwardsCompatibility from './backwards-compatibility';
import * as commands from './commands/';
import * as commandsInternal from './commands/internal';

export default class Component extends BackwardsCompatibility {
	__construct( args = {} ) {
		super.__construct( args );

		/**
		 * Auto save timer handlers.
		 *
		 * @type {Object}
		 */
		this.autoSaveTimers = {};

		/**
		 * Auto save interval.
		 *
		 * @type {number}
		 */
		this.autoSaveInterval = elementor.config.autosave_interval * 1000;

		elementorCommon.elements.$window.on( 'beforeunload', () => {
			if ( this.isEditorChanged() ) {
				// Returns a message to confirm dialog.
				return elementor.translate( 'before_unload_alert' );
			}
		} );
	}

	getNamespace() {
		return 'document/save';
	}

	/**
	 * TODO: test
	 * @param {boolean} hasChanged
	 * @param {Document} document
	 */
	startAutoSave( hasChanged, document ) {
		this.stopAutoSave( document );

		if ( hasChanged ) {
			this.autoSaveTimers[ document.id ] = setTimeout( () => {
				$e.run( 'document/save/auto', { document } );
			}, this.autoSaveInterval );
		}
	}

	/**
	 * TODO: test
	 * @param {Document} document
	 */
	stopAutoSave( document ) {
		if ( this.autoSaveTimers[ document.id ] ) {
			clearTimeout( this.autoSaveTimers[ document.id ] );

			delete this.autoSaveTimers[ document.id ];
		}
	}

	defaultCommands() {
		return {
			auto: ( args ) => ( new commands.Auto( args ).run() ),
			default: ( args ) => ( new commands.Default( args ).run() ),
			discard: ( args ) => ( new commands.Discard( args ).run() ),
			draft: ( args ) => ( new commands.Draft( args ).run() ),
			pending: ( args ) => ( new commands.Pending( args ).run() ),
			publish: ( args ) => ( new commands.Publish( args ).run() ),
			update: ( args ) => ( new commands.Update( args ).run() ),
		};
	}

	defaultCommandsInternal() {
		return {
			save: ( args ) => ( new commandsInternal.Save( args ).run() ),
		};
	}

	setFlagEditorChange( status ) {
		const document = elementor.documents.getCurrent();

		if ( status && document.editor.isSaving ) {
			document.editor.isChangedDuringSave = true;
		}

		elementor.channels.editor
			.reply( 'status', status )
			.trigger( 'status:change', status );
	}

	isEditorChanged() {
		return ( true === elementor.channels.editor.request( 'status' ) );
	}
}
