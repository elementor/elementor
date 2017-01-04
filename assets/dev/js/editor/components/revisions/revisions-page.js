module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-revisions',

	template: '#tmpl-elementor-panel-revisions',

	childView: require( './revision-view' ),

	childViewContainer: '#elementor-revisions-list',

	emptyView: require( './no-revisions-view' ),

	ui: {
		discard: '.elementor-panel-scheme-discard .elementor-button',
		apply: '.elementor-panel-scheme-save .elementor-button'
	},

	events: {
		'click @ui.discard': 'onDiscardClick',
		'click @ui.apply': 'onApplyClick'
	},

	isRevisionApplied: false,

	jqueryXhr: null,

	currentPreviewId: null,

	isFirstChange: true,

	initialize: function() {
		this.collection = new Backbone.Collection( elementor.config.revisions );

		this.listenTo( elementor.channels.editor, 'change', this.setApplyButtonState )
			.listenTo( elementor.channels.editor, 'saved', this.onEditorSaved );
	},

	setApplyButtonState: function( editorChanged ) {
		this.ui.apply.prop( 'disabled', ! editorChanged );
	},

	setDiscardButtonDisabled: function( disabled ) {
		this.ui.discard.prop( 'disabled', disabled );
	},

	setEditorData: function( data ) {
		var collection = elementor.getRegion( 'sections' ).currentView.collection;

		collection.reset();
		collection.set( data );
	},

	addRevisionToList: function( revision ) {
		this.collection.add( revision, { at: 0 } );
	},

	saveAutoDraft: function() {
		var self = this;

		return elementor.ajax.send( 'save_builder', {
			data: {
				post_id: elementor.config.post_id,
				status: 'autosave',
				data: JSON.stringify( elementor.elements.toJSON() )
			},
			success: function( data ) {
				if ( data.last_revision ) {
					self.addRevisionToList( data.last_revision );
				}
			}
		} );
	},

	deleteRevision: function( revisionView ) {
		var self = this,
			revisionID = revisionView.model.get( 'id' );

		revisionView.$el.addClass( 'elementor-state-show' );

		elementor.ajax.send( 'delete_revision', {
			data: {
				id: revisionID
			},
			success: function() {
				if ( revisionID === self.currentPreviewId ) {
					self.onDiscardClick();
				}

				self.collection.remove( revisionView.model );
			},
			error: function( data ) {
				revisionView.$el.removeClass( 'elementor-state-show' );

				alert( 'An error occurs' );
			}
		} );
	},

	enterPreviewMode: function() {
		elementor.changeEditMode( 'review' );
	},

	exitPreviewMode: function() {
		elementor.changeEditMode( 'edit' );
	},

	onEditorSaved: function() {
		this.exitPreviewMode();
	},

	onApplyClick: function() {
		elementor.getPanelView().getChildView( 'footer' )._publishBuilder();

		this.isRevisionApplied = true;

		this.setDiscardButtonDisabled( false );
	},

	onChildviewDeleteClick: function( childView ) {
		var self = this,
			type = childView.model.get( 'type' ),
			id = childView.model.get( 'id' );

		var removeDialog = elementor.dialogsManager.createWidget( 'confirm', {
			message: elementor.translate( 'dialog_confirm_delete', [ type ] ),
			headerMessage: elementor.translate( 'delete_element', [ type ] ),
			strings: {
				confirm: elementor.translate( 'delete' ),
				cancel: elementor.translate( 'cancel' )
			},
			defaultOption: 'confirm',
			onConfirm: function() {
				self.deleteRevision( childView );
			}
		} );

		removeDialog.show();
	},

	onChildviewClick: function( childView ) {
		var self = this,
			id = childView.model.get( 'id' );

		if ( id === self.currentPreviewId ) {
			return;
		}

		if ( this.jqueryXhr ) {
			this.jqueryXhr.abort();
		}

		if ( elementor.isEditorChanged() && self.isFirstChange && null === self.currentPreviewId ) {
			this.saveAutoDraft();

			self.isFirstChange = false;
		}

		childView.$el.addClass( 'elementor-state-show' );

		this.jqueryXhr = elementor.ajax.send( 'get_revision_preview', {
			data: {
				id: id
			},
			success: function( data ) {
				self.setEditorData( data );
				self.setDiscardButtonDisabled( false );

				self.currentPreviewId = id;
				self.jqueryXhr = null;

				Backbone.$( '.elementor-revision-current-preview' ).removeClass( 'elementor-revision-current-preview' );
				childView.$el.removeClass( 'elementor-state-show' ).addClass( 'elementor-revision-current-preview' );

				self.enterPreviewMode();

			},
			error: function( data ) {
				childView.$el.removeClass( 'elementor-state-show elementor-revision-current-preview' );

				if ( 'abort' === self.jqueryXhr.statusText ) {
					return;
				}

				this.currentPreviewId = null;

				alert( 'An error occurs' );
			}
		} );
	},

	onDiscardClick: function() {
		this.setEditorData( elementor.config.data );

		elementor.setFlagEditorChange( this.isRevisionApplied );

		if ( this.isRevisionApplied ) {
			this.isRevisionApplied = false;
		}

		this.setDiscardButtonDisabled( true );

		this.currentPreviewId = null;

		this.isFirstChange = true;

		this.exitPreviewMode();

		Backbone.$( '.elementor-revision-current-preview' ).removeClass( 'elementor-revision-current-preview' );
	}
} );
