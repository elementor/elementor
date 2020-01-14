import CommandInternalBase from 'elementor-api/modules/command-internal-base';

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
			elements = container.model.get( 'elements' ).toJSON( { remove: ['default', 'editSettings', 'defaultEditSettings'] } ),
			settings = container.settings.toJSON( { remove: ['default'] } ),
			oldStatus = container.settings.get( 'post_status' ),
			statusChanged = oldStatus !== options.status;

		// TODO: BC.
		elementor.saver.trigger( 'before:save', options )
			.trigger( 'before:save:' + options.status, options );

		document.isSaving = true;
		document.isChangedDuringSave = false;

		settings.post_status = options.status;

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
			if ( ! document.isChangedDuringSave ) {
				$e.internal( 'document/save/set-is-modified', { status: false } );
			}
		}

		if ( data.config ) {
			// TODO: Move to es6.
			jQuery.extend( true, elementor.config.document, data.config );
		}

		elementor.config.document.elements = elements;

		elementor.channels.editor.trigger( 'saved', data );

		// TODO: BC.
		elementor.saver.trigger( 'after:save', data )
			.trigger( 'after:save:' + options.status, data );

		if ( statusChanged ) {
			elementor.saver.trigger( 'page:status:change', options.status, oldStatus );
		}

		const result = {
			data,
			statusChanged,
		};

		if ( _.isFunction( options.onSuccess ) ) {
			options.onSuccess.call( this, result );
		}

		return result;
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
		document.isSaving = false;
	}
}

export default Save;
