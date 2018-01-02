var Module = require( 'elementor-utils/module' );

module.exports = Module.extend( {
	autoSaveTimer: null,

	isSaving: false,

	isChangedDuringSave: false,

	__construct: function() {
		this.setWorkSaver();
	},

	startTimer: function( hasChanges ) {
		if ( hasChanges ) {
			this.autoSaveTimer = window.setTimeout( _.bind( this.doAutoSave, this ), 5000 );
		} else if ( ! this.isChangedDuringSave ) {
			clearTimeout( this.autoSaveTimer );
		}
	},

	doAutoSave: function() {
		var editorMode = elementor.channels.dataEditMode.request( 'activeMode' );

		if ( ! this.isEditorChanged() || this.isSaving || 'edit' !== editorMode ) {
			return;
		}

		this.saveAutoSave();

		this.autoSaveTimer = null;
	},

	saveAutoSave: function( options ) {
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
		elementor.ajax.send( 'discard_changes', {
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
			newData = elementor.elements.toJSON( { removeDefault: true } ),
			oldStatus = elementor.settings.page.model.get( 'post_status' ),
			statusChanged = oldStatus !== options.status;

		self.trigger( 'before:save', options )
			.trigger( 'before:save:' + options.status, options );

		self.isSaving = true;

		self.isChangedDuringSave = false;

		self.xhr = elementor.ajax.send( 'save_builder', {
			data: {
				post_id: elementor.config.post_id,
				status: options.status,
				data: JSON.stringify( newData )
			},

			success: function( data ) {
				self.afterAjax();

				if ( ! self.isChangedDuringSave ) {
					self.setFlagEditorChange( false );
				}

				if ( 'autosave' !== options.status && statusChanged ) {
					elementor.settings.page.model.set( 'post_status', options.status );
				}

				if ( data.config ) {
					jQuery.extend( true, elementor.config, data.config );
				}

				elementor.config.data = newData;

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
			}
		} );

		return self.xhr;
	},

	afterAjax: function() {
		this.isSaving = false;
		this.xhr = null;
	}
} );
