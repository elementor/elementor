import Base from './../commands/base';

// Save.
export default class extends Base {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory() {
		// No history required for the command.
		return false;
	}

	apply( args ) {
		const { status = 'draft', containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			if ( container.isSaving ) {
				return;
			}

			container.isSaving = true;

			const elements = container.children.toJSON( { remove: [ 'default', 'editSettings', 'defaultEditSettings' ] } ),
				settings = container.settings.toJSON( { remove: [ 'default' ] } ),
				oldStatus = container.settings.get( 'post_status' ),
				statusChanged = oldStatus !== status;

			container.isChangedDuringSave = false;

			settings.post_status = status;

			/*
			TODO:
			self.trigger( 'before:save', options )
			.trigger( 'before:save:' + options.status, options );
			*/

			elementorCommon.ajax.addRequest( 'save_document', {
				data: {
					id: container.document.id,
					status,
					elements,
					settings,
				},

				success: ( data ) => {
					delete container.isSaving;

					if ( 'autosave' !== status ) {
						if ( statusChanged ) {
							container.model.set( 'post_status', status );
						}

						// Notice: Must be after update page.model.post_status to the new status.
						if ( ! container.isChangedDuringSave ) {
							container.isSaved = true;
						}
					}

					if ( data.document ) {
						jQuery.extend( true, container.document, data.document );
					}

					container.document.elements = elements;

					/*
					TODO:
					elementor.channels.editor.trigger( 'saved', data );

					self.trigger( 'after:save', data )
					.trigger( 'after:save:' + options.status, data );

					if ( statusChanged ) {
						self.trigger( 'page:status:change', options.status, oldStatus );
					}

					if ( _.isFunction( options.onSuccess ) ) {
						options.onSuccess.call( this, data );
					}
					*/
				},
				error: ( data ) => {
					delete container.isSaving;

					/*
					TODO:
					self.trigger( 'after:saveError', data )
					.trigger( 'after:saveError:' + options.status, data );
					*/
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
				},
			} );

		/*
		TODO:
		this.trigger( 'save', options );
		*/
		} );
	}
}
