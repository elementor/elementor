module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-revisions',

	template: '#tmpl-elementor-panel-revisions',

	childView: require( './revision-view' ),

	childViewContainer: '#elementor-revisions-list',

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

	initialize: function() {
		this.listenTo( elementor.channels.editor, 'saved', this.onEditorSaved );
	},

	setRevisionsButtonsActive: function( active ) {
		this.ui.apply.add( this.ui.discard ).prop( 'disabled', ! active );
	},

	setEditorData: function( data ) {
		var collection = elementor.getRegion( 'sections' ).currentView.collection;

		collection.reset();
		collection.set( data );
	},

	saveAutoDraft: function() {
		return elementor.ajax.send( 'save_builder', {
			data: {
				post_id: elementor.config.post_id,
				status: 'autosave',
				data: JSON.stringify( elementor.elements.toJSON() )
			},
			success: function( data ) {
				if ( data.last_revision ) {
					elementor.revisions.addRevision( data.last_revision );
				}
			}
		} );
	},

	deleteRevision: function( revisionView ) {
		var self = this;

		revisionView.$el.addClass( 'elementor-revision-item-loading' );

		elementor.revisions.deleteRevision( revisionView.model, {
			success: function() {
				if ( revisionView.model.get( 'id' ) === self.currentPreviewId ) {
					self.onDiscardClick();
				}

				self.currentPreviewId = null;
			},
			error: function( data ) {
				revisionView.$el.removeClass( 'elementor-revision-item-loading' );

				alert( 'An error occurred' );
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

		this.currentPreviewId = null;

		this.setRevisionsButtonsActive( false );
	},

	onDiscardClick: function() {
		this.setEditorData( elementor.config.data );

		elementor.setFlagEditorChange( this.isRevisionApplied );

		this.isRevisionApplied = false;

		this.setRevisionsButtonsActive( false );

		this.currentPreviewId = null;

		this.exitPreviewMode();

		this.$( '.elementor-revision-current-preview' ).removeClass( 'elementor-revision-current-preview' );
	},

	onDestroy: function() {
		if ( this.currentPreviewId ) {
			this.onDiscardClick();
		}
	},

	onChildviewDetailsAreaClick: function( childView ) {
		var self = this,
			id = childView.model.get( 'id' );

		if ( id === self.currentPreviewId ) {
			return;
		}

		if ( this.jqueryXhr ) {
			this.jqueryXhr.abort();
		}

		if ( elementor.isEditorChanged() && null === self.currentPreviewId ) {
			this.saveAutoDraft();
		}

		childView.$el.addClass( 'elementor-revision-item-loading' );

		this.jqueryXhr = elementor.ajax.send( 'get_revision_preview', {
			data: {
				id: id
			},
			success: function( data ) {
				self.setEditorData( data );

				self.setRevisionsButtonsActive( true );

				self.currentPreviewId = id;

				self.jqueryXhr = null;

				self.$( '.elementor-revision-current-preview' ).removeClass( 'elementor-revision-current-preview' );

				childView.$el.removeClass( 'elementor-revision-item-loading' ).addClass( 'elementor-revision-current-preview' );

				self.enterPreviewMode();
			},
			error: function( data ) {
				childView.$el.removeClass( 'elementor-revision-item-loading elementor-revision-current-preview' );

				if ( 'abort' === self.jqueryXhr.statusText ) {
					return;
				}

				this.currentPreviewId = null;

				alert( 'An error occurred' );
			}
		} );
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
	}
} );
