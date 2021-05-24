import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class Save extends CommandInternalBase {
	apply( args ) {
		const { status = 'draft', force = false, onSuccess = null, document = elementor.documents.getCurrent() } = args;

		if ( ! force && document.editor.isSaving ) {
			return jQuery.Deferred().reject( 'Document already in save progress' );
		}

		const container = document.container,
			settings = container.settings.toJSON( { remove: [ 'default' ] } ),
			oldStatus = container.settings.get( 'post_status' );

		// TODO: Remove - Backwards compatibility.
		elementor.saver.trigger( 'before:save', args )
			.trigger( 'before:save:' + status, args );

		document.editor.isSaving = true;
		document.editor.isChangedDuringSave = false;

		settings.post_status = status;

		let elements = [];

		if ( elementor.config.document.panel.has_elements ) {
			elements = container.model.get( 'elements' ).toJSON( { remove: [ 'default', 'editSettings', 'defaultEditSettings' ] } );
		}

		const successArgs = {
			status,
			oldStatus,
			elements,
			document,
			currentHistoryId: document.history.currentItem.get( 'id' ),
		};

		const deferred = elementorCommon.ajax.addRequest( 'save_builder', {
				data: {
					status,
					elements: elements,
					settings: settings,
				},
				error: ( data ) => this.onSaveError( data, status, document ),
			} ).then( ( data ) => this.onSaveSuccess( data, successArgs, onSuccess ) );

		// TODO: Remove - Backwards compatibility
		elementor.saver.trigger( 'save', args );

		return deferred;
	}

	onSaveSuccess( data, args, callback = null ) {
		const { status, oldStatus, elements, document, currentHistoryId } = args;

		this.onAfterAjax( document );

		document.editor.lastSaveHistoryId = currentHistoryId;

		// Remove document cache.
		elementor.documents.invalidateCache( document.id );

		const statusChanged = status !== oldStatus,
			result = {
				data,
				statusChanged,
			};

		// Document is switched during the save, do nothing.
		if ( document !== elementor.documents.getCurrent() ) {
			return result;
		}

		if ( ! document.editor.isChangedDuringSave ) {
			document.editor.isSaved = true;
		}

		// TODO: Move to hook.
		if ( 'autosave' !== status ) {
			if ( statusChanged ) {
				$e.run( 'document/elements/settings', {
					container: elementor.settings.page.getEditedView().getContainer(),
					settings: {
						post_status: status,
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

		// TODO: Remove - Backwards compatibility
		elementor.channels.editor.trigger( 'saved', data );

		// TODO: Remove - Backwards compatibility
		elementor.saver.trigger( 'after:save', data )
			.trigger( 'after:save:' + status, data );

		// TODO: Remove - Backwards compatibility
		if ( statusChanged ) {
			elementor.saver.trigger( 'page:status:change', status, oldStatus );
		}

		if ( _.isFunction( callback ) ) {
			callback.call( this, result );
		}

		return result;
	}

	onSaveError( data, status, document ) {
		this.onAfterAjax( document );

		// TODO: Remove - Backwards compatibility
		elementor.saver.trigger( 'after:saveError', data )
			.trigger( 'after:saveError:' + status, data );

		let message;

		if ( _.isString( data ) ) {
			message = data;
		} else if ( data.statusText ) {
			message = elementor.createAjaxErrorMessage( data );

			if ( 0 === data.readyState ) {
				message += ' ' + __( 'Saving has been disabled until you’re reconnected.', 'elementor' );
			}
		} else if ( data[ 0 ] && data[ 0 ].code ) {
			message = __( 'Server Error', 'elementor' ) + ' ' + data[ 0 ].code;
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
