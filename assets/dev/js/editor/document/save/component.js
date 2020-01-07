import BackwardsCompatibility from './backwards-compatibility';
import * as Commands from './commands';

export default class Component extends BackwardsCompatibility {
	__construct( args = {} ) {
		super.__construct( args );

		this.isSaving = false;
		this.isChangedDuringSave = false;

		this.autoSaveTimer = null;
		this.autoSaveInterval = elementor.config.autosave_interval * 1000;

		elementorCommon.elements.$window.on( 'beforeunload', () => {
			if ( this.isEditorChanged() ) {
				return elementor.translate( 'before_unload_alert' );
			}
		} );
	}

	getNamespace() {
		return 'document/save';
	}

	defaultCommands() {
		return {
			auto: ( args ) => ( new Commands.Auto( args ).run() ),
			default: ( args ) => ( new Commands.Default( args ).run() ),
			discard: ( args ) => ( new Commands.Discard( args ).run() ),
			draft: ( args ) => ( new Commands.Draft( args ).run() ),
			pending: ( args ) => ( new Commands.Pending( args ).run() ),
			publish: ( args ) => ( new Commands.Publish( args ).run() ),
			update: ( args ) => ( new Commands.Update( args ).run() ),
		};
	}

	saveEditor( options ) {
		if ( this.isSaving ) {
			return;
		}

		options = Object.assign( options, {
			status: 'draft',
			onSuccess: null,
		} );

		const container = options.document.container || elementor.document.getCurrent(),
			elements = container.model.get( 'elements' ).toJSON( { remove: [ 'default', 'editSettings', 'defaultEditSettings' ] } ),
			settings = container.settings.toJSON( { remove: [ 'default' ] } ),
			oldStatus = container.settings.get( 'post_status' ),
			statusChanged = oldStatus !== options.status;

		this.trigger( 'before:save', options )
			.trigger( 'before:save:' + options.status, options );

		this.isSaving = true;
		this.isChangedDuringSave = false;

		settings.post_status = options.status;

		elementorCommon.ajax.addRequest( 'save_builder', {
			data: {
				status: options.status,
				elements: elements,
				settings: settings,
			},

			success: ( data ) => this.onSaveSuccess( data, oldStatus, statusChanged, elements, options ),
			error: ( data ) => this.onSaveError( data, options ),
		} );

		this.trigger( 'save', options );
	}

	startTimer( hasChanges ) {
		clearTimeout( this.autoSaveTimer );

		if ( hasChanges ) {
			this.autoSaveTimer = setTimeout( () => {
				$e.run( 'document/save/auto' );
			}, this.autoSaveInterval );
		}
	}

	setFlagEditorChange( status ) {
		if ( status && this.isSaving ) {
			this.isChangedDuringSave = true;
		}

		this.startTimer( status );

		elementor.channels.editor
			.reply( 'status', status )
			.trigger( 'status:change', status );
	}

	isEditorChanged() {
		return ( true === elementor.channels.editor.request( 'status' ) );
	}

	onSaveSuccess( data, oldStatus, statusChanged, elements, options ) {
		this.onAfterAjax();

		if ( 'autosave' !== options.status ) {
			if ( statusChanged ) {
				elementor.settings.page.model.set( 'post_status', options.status );
			}

			// Notice: Must be after update page.model.post_status to the new status.
			if ( ! this.isChangedDuringSave ) {
				elementor.saver.setFlagEditorChange( false );
			}
		}

		if ( data.config ) {
			// TODO: Move to es6
			jQuery.extend( true, elementor.config, data.config );
		}

		elementor.config.data = elements;

		elementor.channels.editor.trigger( 'saved', data );

		this.trigger( 'after:save', data )
			.trigger( 'after:save:' + options.status, data );

		if ( statusChanged ) {
			this.trigger( 'page:status:change', options.status, oldStatus );
		}

		if ( _.isFunction( options.onSuccess ) ) {
			options.onSuccess.call( this, data );
		}
	}

	onSaveError( data, options ) {
		this.onAfterAjax();

		this.trigger( 'after:saveError', data )
			.trigger( 'after:saveError:' + options.status, data );

		let message;

		if ( _.isString( data ) ) {
			message = data;
		} else if ( data.statusText ) {
			message = elementor.createAjaxErrorMessage( data );

			if ( 0 === data.readyState ) {
				message += ' ' + elementor.translate( 'saving_disabled' );
			}
		} else if ( data[ 0 ] && data[ 0 ].code ) {
			message = elementor.translate( 'server_error' ) + ' ' + data[ 0 ].code;
		}

		elementor.notifications.showToast( {
			message: message,
		} );
	}

	onAfterAjax() {
		this.isSaving = false;
	}
}
