import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class Save extends CommandInternalBase {
	apply( args ) {
		let { options = {} } = args;

		const document = options.document || elementor.documents.getCurrent();

		if ( document.editor.isSaving ) {
			return;
		}

		options = Object.assign( {
			status: 'draft',
			onSuccess: null,
		}, options );

		const container = document.container,
			settings = container.settings.toJSON( { remove: [ 'default' ] } ),
			oldStatus = container.settings.get( 'post_status' ),
			statusChanged = oldStatus !== options.status;

		let elements = [];

		// TODO: BC.
		elementor.saver.trigger( 'before:save', options )
		.trigger( 'before:save:' + options.status, options );

		document.editor.isSaving = true;
		document.editor.isChangedDuringSave = false;

		settings.post_status = options.status;

		if ( elementor.config.document.panel.has_elements ) {
			elements = container.model.get( 'elements' ).toJSON( { remove: [ 'default', 'editSettings', 'defaultEditSettings' ] } );
		}

		const deferred = elementorCommon.ajax.addRequest( 'save_builder', {
			data: {
				status: options.status,
				elements: elements,
				settings: settings,
			},

			error: ( data ) => this.onSaveError( data, options, document ),
		} ).then( ( data ) => this.onSaveSuccess( data, oldStatus, statusChanged, elements, options, document )
		);

		// TODO: BC.
		elementor.saver.trigger( 'save', options );

		return deferred;
	}

	onSaveSuccess( data, oldStatus, statusChanged, elements, options, document ) {
		this.onAfterAjax( document );

		elementor.documents.invalidateCache( document.id );

		// Document is switched doring the save, do nothing.
		if ( document !== elementor.documents.getCurrent() ) {
			return;
		}

		if ( 'autosave' !== options.status ) {
			if ( statusChanged ) {
				$e.run( 'document/elements/settings', {
					container: elementor.settings.page.getEditedView().getContainer(),
					settings: {
						post_status: options.status,
					},
					options: {
						external: true,
					},
				} );
			}

			// Notice: Must be after update page.model.post_status to the new status.
			if ( ! document.editor.isChangedDuringSave ) {
				$e.internal( 'document/save/set-is-modified', { status: false } );
			}
		}

		if ( data.config ) {
			// TODO: Move to es6.
			jQuery.extend( true, document.config, data.config.document );
		}

		if ( document.config.elements ) {
			document.config.elements = elements;
		}

		elementor.channels.editor.trigger( 'saved', data );

		// TODO: BC.
		elementor.saver.trigger( 'after:save', data )
			.trigger( 'after:save:' + options.status, data );

		if ( statusChanged ) {
			elementor.saver.trigger( 'page:status:change', options.status, oldStatus );
		}

		if ( _.isFunction( options.onSuccess ) ) {
			options.onSuccess.call( this, data );
		}

		return {
			data,
			statusChanged,
		};
	}

	onSaveError( data, options, document ) {
		this.onAfterAjax( document );

		// TODO: BC.
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
		document.editor.isSaving = false;
	}
}

export default Save;
