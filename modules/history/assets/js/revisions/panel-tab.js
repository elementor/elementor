module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-revisions',

	template: '#tmpl-elementor-panel-revisions',

	childView: require( './view' ),

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

	currentPreviewItem: null,

	initialize: function() {
		this.listenTo( elementor.channels.editor, 'saved', this.onEditorSaved );
	},

	getRevisionViewData: function( revisionView ) {
		var self = this,
			revisionID = revisionView.model.get( 'id' );

		self.jqueryXhr = elementor.ajax.send( 'get_revision_data', {
			data: {
				id: revisionID
			},
			success: function( data ) {
				self.setEditorData( data );

				self.setRevisionsButtonsActive( true );

				self.jqueryXhr = null;

				revisionView.$el.removeClass( 'elementor-revision-item-loading' );

				self.enterReviewMode();
			},
			error: function( data ) {
				revisionView.$el.removeClass( 'elementor-revision-item-loading' );

				if ( 'abort' === self.jqueryXhr.statusText ) {
					return;
				}

				self.currentPreviewItem = null;

				self.currentPreviewId = null;

				alert( 'An error occurred' );
			}
		} );
	},

	setRevisionsButtonsActive: function( active ) {
		this.ui.apply.add( this.ui.discard ).prop( 'disabled', ! active );
	},

	setEditorData: function( data ) {
		var collection = elementor.getRegion( 'sections' ).currentView.collection;

		collection.reset( data );
	},

	deleteRevision: function( revisionView ) {
		var self = this;

		revisionView.$el.addClass( 'elementor-revision-item-loading' );

		elementor.history.revisions.deleteRevision( revisionView.model, {
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

	enterReviewMode: function() {
		elementor.changeEditMode( 'review' );
	},

	exitReviewMode: function() {
		elementor.changeEditMode( 'edit' );
	},

	navigate: function( reverse ) {
		var currentPreviewItemIndex = this.collection.indexOf( this.currentPreviewItem.model ),
			requiredIndex = reverse ? currentPreviewItemIndex - 1 : currentPreviewItemIndex + 1;

		if ( requiredIndex < 0 ) {
			requiredIndex = this.collection.length - 1;
		}

		if ( requiredIndex >= this.collection.length ) {
			requiredIndex = 0;
		}

		this.children.findByIndex( requiredIndex ).ui.detailsArea.trigger( 'click' );
	},

	onEditorSaved: function() {
		this.exitReviewMode();

		this.setRevisionsButtonsActive( false );
	},

	onApplyClick: function() {
		elementor.getPanelView().getChildView( 'footer' )._publishBuilder();

		this.isRevisionApplied = true;

		this.currentPreviewId = null;
	},

	onDiscardClick: function() {
		this.setEditorData( elementor.config.data );

		elementor.setFlagEditorChange( this.isRevisionApplied );

		this.isRevisionApplied = false;

		this.setRevisionsButtonsActive( false );

		this.currentPreviewId = null;

		this.exitReviewMode();

		if ( this.currentPreviewItem ) {
			this.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview' );
		}
	},

	onDestroy: function() {
		if ( this.currentPreviewId ) {
			this.onDiscardClick();
		}
	},

	onRenderCollection: function() {
		if ( ! this.currentPreviewId ) {
			return;
		}

		var currentPreviewModel = this.collection.findWhere({ id: this.currentPreviewId });

		this.currentPreviewItem = this.children.findByModelCid( currentPreviewModel.cid );

		this.currentPreviewItem.$el.addClass( 'elementor-revision-current-preview' );
	},

	onChildviewDetailsAreaClick: function( childView ) {
		var self = this,
			revisionID = childView.model.get( 'id' );

		if ( revisionID === self.currentPreviewId ) {
			return;
		}

		if ( this.jqueryXhr ) {
			this.jqueryXhr.abort();
		}

		if ( self.currentPreviewItem ) {
			self.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview' );
		}

		childView.$el.addClass( 'elementor-revision-current-preview elementor-revision-item-loading' );

		if ( elementor.isEditorChanged() && null === self.currentPreviewId ) {
			elementor.saveEditor( {
				status: 'autosave',
				onSuccess: function() {
					self.getRevisionViewData( childView );
				}
			} );
		} else {
			self.getRevisionViewData( childView );
		}

		self.currentPreviewItem = childView;

		self.currentPreviewId = revisionID;
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
