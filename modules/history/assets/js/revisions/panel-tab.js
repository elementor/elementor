module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-revisions',

	template: '#tmpl-elementor-panel-revisions',

	childView: require( './view' ),

	childViewContainer: '#elementor-revisions-list',

	ui: {
		discard: '.elementor-panel-scheme-discard .elementor-button',
		apply: '.elementor-panel-scheme-save .elementor-button',
	},

	events: {
		'click @ui.discard': 'onDiscardClick',
		'click @ui.apply': 'onApplyClick',
	},

	isRevisionApplied: false,

	currentPreviewId: null,

	currentPreviewItem: null,

	document: null,

	initialize: function( options ) {
		this.document = options.document;

		this.collection = this.document.revisions.getItems();

		this.listenTo( elementor.channels.editor, 'saved', this.onEditorSaved );

		this.currentPreviewId = elementor.config.current_revision_id;
	},

	getRevisionViewData: function( revisionView ) {
		var self = this;

		this.document.revisions.getRevisionDataAsync( revisionView.model.get( 'id' ), {
			success: function( data ) {
				self.document.revisions.setEditorData( data.elements );

				elementor.settings.page.model.set( data.settings );

				self.setRevisionsButtonsActive( true );

				revisionView.$el.removeClass( 'elementor-revision-item-loading' );

				self.enterReviewMode();
			},
			error: function( errorMessage ) {
				revisionView.$el.removeClass( 'elementor-revision-item-loading' );

				self.currentPreviewItem = null;

				self.currentPreviewId = null;

				alert( errorMessage );
			},
		} );
	},

	setRevisionsButtonsActive: function( active ) {
		this.ui.apply.add( this.ui.discard ).prop( 'disabled', ! active );
	},

	deleteRevision: function( revisionView ) {
		var self = this;

		revisionView.$el.addClass( 'elementor-revision-item-loading' );

		this.document.revisions.deleteRevision( revisionView.model, {
			success: function() {
				if ( revisionView.model.get( 'id' ) === self.currentPreviewId ) {
					self.onDiscardClick();
				}

				self.currentPreviewId = null;
			},
			error: function() {
				revisionView.$el.removeClass( 'elementor-revision-item-loading' );

				alert( 'An error occurred' );
			},
		} );
	},

	enterReviewMode: function() {
		elementor.changeEditMode( 'review' );
	},

	exitReviewMode: function() {
		elementor.changeEditMode( 'edit' );
	},

	navigate: function( reverse ) {
		if ( ! this.currentPreviewId || ! this.currentPreviewItem || this.children.length <= 1 ) {
			return;
		}

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

		this.currentPreviewId = elementor.config.current_revision_id;
	},

	onApplyClick: function() {
		$e.run( 'document/save/set-is-modified', { status: true } );

		$e.run( 'document/save/auto', { force: true } );

		this.isRevisionApplied = true;

		this.currentPreviewId = null;

		this.document.history.getItems().reset();
	},

	onDiscardClick: function() {
		this.document.revisions.setEditorData( elementor.config.data );

		$e.run( 'document/save/set-is-modified', { status: this.isRevisionApplied } );

		this.isRevisionApplied = false;

		this.setRevisionsButtonsActive( false );

		this.currentPreviewId = null;

		this.exitReviewMode();

		if ( this.currentPreviewItem ) {
			this.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview' );
		}
	},

	onDestroy: function() {
		if ( this.currentPreviewId && this.currentPreviewId !== elementor.config.current_revision_id ) {
			this.onDiscardClick();
		}
	},

	onRenderCollection: function() {
		if ( ! this.currentPreviewId ) {
			return;
		}

		var currentPreviewModel = this.collection.findWhere( { id: this.currentPreviewId } );

		// Ensure the model is exist and not deleted during a save.
		if ( currentPreviewModel ) {
			this.currentPreviewItem = this.children.findByModelCid( currentPreviewModel.cid );
			this.currentPreviewItem.$el.addClass( 'elementor-revision-current-preview' );
		}
	},

	onChildviewDetailsAreaClick: function( childView ) {
		var self = this,
			revisionID = childView.model.get( 'id' );

		if ( revisionID === self.currentPreviewId ) {
			return;
		}

		if ( self.currentPreviewItem ) {
			self.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview elementor-revision-item-loading' );
		}

		childView.$el.addClass( 'elementor-revision-current-preview elementor-revision-item-loading' );

		if ( elementor.saver.isEditorChanged() && ( null === self.currentPreviewId || elementor.config.current_revision_id === self.currentPreviewId ) ) {
			$e.run( 'document/save/save', {
				status: 'autosave',
				onSuccess: function() {
					self.getRevisionViewData( childView );
				},
			} );
		} else {
			self.getRevisionViewData( childView );
		}

		self.currentPreviewItem = childView;

		self.currentPreviewId = revisionID;
	},
} );
