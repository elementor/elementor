var Module = require( 'elementor-utils/module' );

module.exports = Module.extend( {
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
			this.autoSaveTimer = window.setTimeout( _.bind( this.doAutoSave, this ), this.autosaveInterval );
		}
	},

	saveDraft: function() {
		var postStatus = elementor.settings.page.model.get( 'post_status' );

		if ( ! elementor.saver.isEditorChanged() && 'draft' !== postStatus ) {
			return;
		}

		switch ( postStatus ) {
			case 'publish':
			case 'private':
				this.doAutoSave();
				break;
			default:
				// Update and create a revision
				this.update();
		}
	},

	doAutoSave: function() {
		var editorMode = elementor.channels.dataEditMode.request( 'activeMode' );

		// Avoid auto save for Revisions Preview changes.
		if ( 'edit' !== editorMode ) {
			return;
		}

		this.saveAutoSave();
	},

	saveAutoSave: function( options ) {
		if ( ! this.isEditorChanged() ) {
			return;
		}

		options = _.extend( {
			status: 'autosave'
		}, options );

		this.saveEditor( options );
	},

	savePending: function( options ) {
		options = _.extend( {
			status: 'pending'
		}, options );

		this.saveEditor( options );
	},

	discard: function() {
		var self = this;
		elementor.ajax.addRequest( 'discard_changes', {
			data: {
				post_id: elementor.config.post_id
			},

			success: function() {
				self.setFlagEditorChange( false );
				location.href = elementor.config.exit_to_dashboard_url;
			}
		} );
	},

	update: function( options ) {
		options = _.extend( {
			status: elementor.settings.page.model.get( 'post_status' )
		}, options );

		this.saveEditor( options );
	},

	publish: function( options ) {
		options = _.extend( {
			status: 'publish'
		}, options );

		this.saveEditor( options );
	},

	setFlagEditorChange: function( status ) {
		if ( status && this.isSaving ) {
			this.isChangedDuringSave = true;
		}

		this.startTimer( status );

		elementor.channels.editor
			.reply( 'status', status )
			.trigger( 'status:change', status );
	},

	isEditorChanged: function() {
		return ( true === elementor.channels.editor.request( 'status' ) );
	},

	setWorkSaver: function() {
		var self = this;
		elementor.$window.on( 'beforeunload', function() {
			if ( self.isEditorChanged() ) {
				return elementor.translate( 'before_unload_alert' );
			}
		} );
	},

	saveEditor: function( options ) {
		if ( this.isSaving ) {
			return;
		}

		options = _.extend( {
			status: 'draft',
			onSuccess: null
		}, options );

		var self = this,
			elements = elementor.elements.toJSON( { removeDefault: true } ),
			settings = elementor.settings.page.model.toJSON( { removeDefault: true } ),
			oldStatus = elementor.settings.page.model.get( 'post_status' ),
			statusChanged = oldStatus !== options.status;

		self.trigger( 'before:save', options )
			.trigger( 'before:save:' + options.status, options );

		self.isSaving = true;

		self.isChangedDuringSave = false;

		if ( 'autosave' !== options.status && statusChanged ) {
			elementor.settings.page.model.set( 'post_status', options.status );
		}

		elementor.ajax.addRequest( 'save_builder', {
			data: {
				post_id: elementor.config.post_id,
				status: options.status,
				elements: elements,
				settings: settings
			},

			success: function( data ) {
				self.afterAjax();

				if ( 'autosave' !== options.status ) {
					if ( statusChanged ) {
						elementor.settings.page.model.set( 'post_status', options.status );
					}

					// Notice: Must be after update page.model.post_status to the new status.
					if ( ! self.isChangedDuringSave ) {
						self.setFlagEditorChange( false );
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

				if ( data.statusText ) {
					message = elementor.ajax.createErrorMessage( data );

					if ( 0 === data.readyState ) {
						message += ' ' + elementor.translate( 'saving_disabled' );
					}
				} else if ( data[0] && data[0].code ) {
					message = elementor.translate( 'server_error' ) + ' ' + data[0].code;
				}

				elementor.notifications.showToast( {
					message: message
				} );
			}
		} );
	},

	afterAjax: function() {
		this.isSaving = false;
	}
} );
