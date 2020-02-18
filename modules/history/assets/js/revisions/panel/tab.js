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

		this.currentPreviewId = elementor.config.document.revisions.current_id;
	},

	getRevisionViewData: function( revisionView ) {
		this.document.revisions.getRevisionDataAsync( revisionView.model.get( 'id' ), {
			success: ( data ) => {
				if ( this.document.config.panel.has_elements ) {
					this.document.revisions.setEditorData( data.elements );
				}

				elementor.settings.page.model.set( data.settings );

				this.setRevisionsButtonsActive( true );

				revisionView.$el.removeClass( 'elementor-revision-item-loading' );

				this.enterReviewMode();
			},
			error: ( errorMessage ) => {
				revisionView.$el.removeClass( 'elementor-revision-item-loading' );

				this.currentPreviewItem = null;

				this.currentPreviewId = null;

				alert( errorMessage );
			},
		} );
	},

	setRevisionsButtonsActive: function( active ) {
		// Check the tab is open.
		if ( ! this.isDestroyed ) {
			this.ui.apply.add( this.ui.discard ).prop( 'disabled', ! active );
		}
	},

	deleteRevision: function( revisionView ) {
		revisionView.$el.addClass( 'elementor-revision-item-loading' );

		this.document.revisions.deleteRevision( revisionView.model, {
			success: () => {
				if ( revisionView.model.get( 'id' ) === this.currentPreviewId ) {
					this.onDiscardClick();
				}

				this.currentPreviewId = null;
			},
			error: () => {
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

		this.currentPreviewId = elementor.config.document.revisions.current_id;
	},

	onApplyClick: function() {
		$e.internal( 'document/save/set-is-modified', { status: true } );

		$e.run( 'document/save/auto', { force: true } );

		this.isRevisionApplied = true;

		this.currentPreviewId = null;

		this.document.history.getItems().reset();
	},

	onDiscardClick: function() {
		if ( this.document.config.panel.has_elements ) {
			this.document.revisions.setEditorData( elementor.config.document.elements );
		}

		$e.internal( 'document/save/set-is-modified', { status: this.isRevisionApplied } );

		this.isRevisionApplied = false;

		this.setRevisionsButtonsActive( false );

		this.currentPreviewId = null;

		this.exitReviewMode();

		if ( this.currentPreviewItem ) {
			this.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview' );
		}
	},

	onDestroy: function() {
		if ( this.currentPreviewId && this.currentPreviewId !== elementor.config.document.revisions.current_id ) {
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
		const revisionID = childView.model.get( 'id' );

		if ( revisionID === this.currentPreviewId ) {
			return;
		}

		if ( this.currentPreviewItem ) {
			this.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview elementor-revision-item-loading' );
		}

		childView.$el.addClass( 'elementor-revision-current-preview elementor-revision-item-loading' );

		const revision = ( null === this.currentPreviewId || elementor.config.document.revisions.current_id === this.currentPreviewId );

		if ( revision && elementor.saver.isEditorChanged() ) {
			// TODO: Change to 'document/save/auto' ?.
			$e.internal( 'document/save/save', {
				status: 'autosave',
				onSuccess: () => {
					this.getRevisionViewData( childView );
				},
			} );
		} else {
			this.getRevisionViewData( childView );
		}

		this.currentPreviewItem = childView;
		this.currentPreviewId = revisionID;
	},
} );
