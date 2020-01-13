import CommandInternalBase from 'elementor-api/modules/command-internal-base';

// TODO: Should not be CommandBase, should not work with CommandBase, print error.
export class Save extends CommandInternalBase {
	apply( args ) {
		let { options = {} } = args;

		const document = options.document || elementor.documents.getCurrent();

		if ( document.isSaving ) {
			return;
		}

		options = Object.assign( {
			status: 'draft',
			onSuccess: null,
		}, options );

		const container = document.container,
			elements = container.model.get( 'elements' ).toJSON( { remove: [ 'default', 'editSettings', 'defaultEditSettings' ] } ),
			settings = container.settings.toJSON( { remove: [ 'default' ] } ),
			oldStatus = container.settings.get( 'post_status' ),
			statusChanged = oldStatus !== options.status;

		// TODO: BC.
		elementor.saver.trigger( 'before:save', options )
			.trigger( 'before:save:' + options.status, options );

		document.isSaving = true;
		document.isChangedDuringSave = false;

		settings.post_status = options.status;

		elementorCommon.ajax.addRequest( 'save_builder', {
			data: {
				status: options.status,
				elements: elements,
				settings: settings,
			},

			success: ( data ) => this.onSaveSuccess( data, oldStatus, statusChanged, elements, options, document ),
			error: ( data ) => this.onSaveError( data, options, document ),
		} );

		// TODO: BC.
		elementor.saver.trigger( 'save', options );
	}

	onSaveSuccess( data, oldStatus, statusChanged, elements, options, document ) {
		this.onAfterAjax( document );

		if ( 'autosave' !== options.status ) {
			if ( statusChanged ) {
				elementor.settings.page.model.set( 'post_status', options.status );
			}

			// Notice: Must be after update page.model.post_status to the new status.
			if ( ! document.isChangedDuringSave ) {
				elementor.saver.setFlagEditorChange( false );
			}
		}

		if ( data.config ) {
			// TODO: Move to es6
			jQuery.extend( true, elementor.config.document, data.config );
		}

		elementor.config.document.elements = elements;

		elementor.channels.editor.trigger( 'saved', data );

		elementor.saver.trigger( 'after:save', data )
			.trigger( 'after:save:' + options.status, data );

		if ( statusChanged ) {
			elementor.saver.trigger( 'page:status:change', options.status, oldStatus );
		}

		if ( _.isFunction( options.onSuccess ) ) {
			options.onSuccess.call( this, data );
		}
	}

	onSaveError( data, options, document ) {
		this.onAfterAjax( document );

		elementor.saver.trigger( 'after:saveError', data )
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

	onAfterAjax( document ) {
		document.isSaving = false;
	}
}

export default Save;
