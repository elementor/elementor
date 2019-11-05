/**
 * TODO: all content of the file should move to `save/component.js` this file should exist only for BC.
 */
module.exports = elementorModules.Module.extend( {
	autoSaveTimer: null,

	autosaveInterval: elementor.config.autosave_interval * 1000,

	isSaving: false,

	isChangedDuringSave: false,

	__construct: function() {
		this.setWorkSaver();
	},

	startTimer: function( hasChanges ) {
		clearTimeout( this.autoSaveTimer );
		if ( hasChanges ) {
			this.autoSaveTimer = setTimeout( () => {
				$e.run( 'document/save/auto', { mode: 'safe' } );
			}, this.autosaveInterval );
		}
	},

	isEditorChanged: function() {
		return ( true === elementor.channels.editor.request( 'status' ) );
	},

	setWorkSaver: function() {
		var self = this;
		elementorCommon.elements.$window.on( 'beforeunload', function() {
			if ( self.isEditorChanged() ) {
				return elementor.translate( 'before_unload_alert' );
			}
		} );
	},

	// TODO: function too big.
	saveEditor: function( options ) {
		if ( this.isSaving ) {
			return;
		}

		// TODO: Move to es6.
		options = _.extend( {
			status: 'draft',
			onSuccess: null,
		}, options );

		var self = this,
			elements = elementor.elements.toJSON( { remove: [ 'default', 'editSettings', 'defaultEditSettings' ] } ),
			settings = elementor.settings.page.model.toJSON( { remove: [ 'default' ] } ),
			oldStatus = elementor.settings.page.model.get( 'post_status' ),
			statusChanged = oldStatus !== options.status;

		self.trigger( 'before:save', options )
			.trigger( 'before:save:' + options.status, options );

		self.isSaving = true;

		self.isChangedDuringSave = false;

		settings.post_status = options.status;

		elementorCommon.ajax.addRequest( 'save_builder', {
			data: {
				status: options.status,
				elements: elements,
				settings: settings,
			},

			success: function( data ) {
				self.afterAjax();

				if ( 'autosave' !== options.status ) {
					if ( statusChanged ) {
						elementor.settings.page.model.set( 'post_status', options.status );
					}

					// Notice: Must be after update page.model.post_status to the new status.
					if ( ! self.isChangedDuringSave ) {
						$e.run( 'document/save/saver', { status: false } );
					}
				}

				if ( data.config ) {
					jQuery.extend( true, elementor.config, data.config );
				}

				elementor.config.data = elements;

				elementor.channels.editor.trigger( 'saved', data );

				self.trigger( 'after:save', data )
					.trigger( 'after:save:' + options.status, data );

				if ( statusChanged ) {
					self.trigger( 'page:status:change', options.status, oldStatus );
				}

				if ( _.isFunction( options.onSuccess ) ) {
					options.onSuccess.call( this, data );
				}
			},
			error: function( data ) {
				self.afterAjax();

				self.trigger( 'after:saveError', data )
					.trigger( 'after:saveError:' + options.status, data );

				var message;

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

		this.trigger( 'save', options );
	},

	afterAjax: function() {
		this.isSaving = false;
	},
} );
