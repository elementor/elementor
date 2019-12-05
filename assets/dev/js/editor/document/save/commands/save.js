import Base from '../../commands/base/base';

export class Save extends Base {
	apply( args ) {
		if ( this.component.isSaving ) {
			return;
		}
		// TODO: Move to es6.
		const options = _.extend( {
			status: 'draft',
			onSuccess: null,
		}, args );

		const container = elementor.documents.getCurrent().container,
			elements = container.model.get( 'elements' ).toJSON( { remove: [ 'default', 'editSettings', 'defaultEditSettings' ] } ),
			settings = container.settings.toJSON( { remove: [ 'default' ] } ),
			oldStatus = container.settings.get( 'post_status' ),
			statusChanged = oldStatus !== options.status;

		this.component.trigger( 'before:save', options )
			.trigger( 'before:save:' + options.status, options );

		this.component.isSaving = true;
		this.component.isChangedDuringSave = false;

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

		this.component.trigger( 'save', options );
	}

	onSaveSuccess( data, oldStatus, statusChanged, elements, options ) {
		this.onAfterAjax();

		if ( 'autosave' !== options.status ) {
			if ( statusChanged ) {
				elementor.settings.page.model.set( 'post_status', options.status );
			}

			// Notice: Must be after update page.model.post_status to the new status.
			if ( ! this.component.isChangedDuringSave ) {
				$e.run( 'document/save/set-is-modified', { status: false } );
			}
		}

		if ( data.config ) {
			// TODO: Move to es6
			jQuery.extend( true, elementor.config, data.config );
		}

		elementor.config.data = elements;

		elementor.channels.editor.trigger( 'saved', data );

		this.component.trigger( 'after:save', data )
			.trigger( 'after:save:' + options.status, data );

		if ( statusChanged ) {
			this.component.trigger( 'page:status:change', options.status, oldStatus );
		}

		if ( _.isFunction( options.onSuccess ) ) {
			options.onSuccess.call( this, data );
		}
	}

	onSaveError( data, options ) {
		this.onAfterAjax();

		this.component.trigger( 'after:saveError', data )
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
		this.component.isSaving = false;
	}
}

export default Save;
