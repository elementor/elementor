var EditorCompositeView;

EditorCompositeView = Marionette.CompositeView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-editor-content' ),

	id: 'elementor-panel-page-editor',

	templateHelpers: function() {
		return {
			elementData: elementor.getElementData( this.model )
		};
	},

	behaviors: {
		HandleInnerTabs: {
			behaviorClass: require( 'elementor-behaviors/inner-tabs' )
		}
	},

	childViewContainer: '#elementor-controls',

	modelEvents: {
		'destroy': 'onModelDestroy'
	},

	ui: {
		tabs: '.elementor-panel-navigation-tab',
		reloadButton: '#elementor-update-preview-button'
	},

	events: {
		'click @ui.tabs': 'onClickTabControl',
		'click @ui.reloadButton': 'onReloadButtonClick'
	},

	activeTab: null,

	initialize: function() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
	},

	filter: function( model ) {
		return model.get( 'tab' ) === this.activeTab;
	},

	activateTab: function( $tab ) {
		this.activeTab = $tab.data( 'tab' );

		this.ui.tabs.removeClass( 'active' );

		$tab.addClass( 'active' );
	},

	getChildView: function( item ) {
		var controlType = item.get( 'type' );

		return elementor.getControlItemView( controlType );
	},

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model.get( 'settings' ),
			elementEditSettings: this.model.get( 'editSettings' )
		};
	},

	onDestroy: function() {
		if ( this.editedElementView ) {
			this.editedElementView.$el.removeClass( 'elementor-element-editable' );
		}

		this.model.trigger( 'editor:close' );

		this.triggerMethod( 'editor:destroy' );
	},

	onBeforeRender: function() {
		var controls = elementor.getElementControls( this.model );

		if ( ! controls ) {
			throw new Error( 'Editor controls not found' );
		}

		// Create new instance of that collection
		this.collection = new Backbone.Collection( _.values( controls ) );
	},

	onRenderTemplate: function() {
		this.activateTab( this.ui.tabs.eq( 0 ) );
	},

	onRender: function() {
		if ( this.editedElementView ) {
			this.editedElementView.$el.addClass( 'elementor-element-editable' );
		}
	},

	onRenderCollection: function() {
		// Create tooltip on controls
		this.$( '.tooltip-target' ).tipsy( {
			gravity: function() {
				// `n` for down, `s` for up
				var gravity = Backbone.$( this ).data( 'tooltip-pos' );

				if ( undefined !== gravity ) {
					return gravity;
				} else {
					return 'n';
				}
			},
			title: function() {
				return this.getAttribute( 'data-tooltip' );
			}
		} );

		this.openFirstSectionInCurrentTab();
	},

	onModelDestroy: function() {
		this.destroy();
	},

	onClickTabControl: function( event ) {
		event.preventDefault();

		var $tab = this.$( event.currentTarget );

		if ( this.activeTab === $tab.data( 'tab' ) ) {
			return;
		}

		this.activateTab( $tab );

		this._renderChildren();
	},

	onDeviceModeChange: function() {
		var self = this;

		self.$el.removeClass( 'elementor-responsive-switchers-open' );

		// Timeout according to preview resize css animation duration
		setTimeout( function() {
			elementor.$previewContents.find( 'html, body' ).animate( {
				scrollTop: self.getOption( 'editedElementView' ).$el.offset().top - elementor.$preview[0].contentWindow.innerHeight / 2
			} );
		}, 500 );
	},

	/**
	 * It's a temp method.
	 *
	 * TODO: Rewrite this method later.
	 */
	openFirstSectionInCurrentTab: function() {
		var self = this,
			openedClass = 'elementor-open',

			childrenUnderSection = this.children.filter( function( view ) {
				return ( ! _.isEmpty( view.model.get( 'section' ) ) );
			} ),

			firstSectionControlView = this.children.filter( function( view ) {
				return ( 'section' === view.model.get( 'type' ) ) && ( self.activeTab === view.model.get( 'tab' ) );
			} );

		// Check if found any section controls
		if ( _.isEmpty( firstSectionControlView ) ) {
			return;
		}

		firstSectionControlView = firstSectionControlView[0];
		firstSectionControlView.ui.heading.addClass( openedClass );

		_.each( childrenUnderSection, function( view ) {
			if ( view.model.get( 'section' ) !== firstSectionControlView.model.get( 'name' ) ) {
				view.$el.removeClass( openedClass );
				return;
			}

			view.$el.addClass( openedClass );
		} );
	},

	onChildviewControlSectionClicked: function( childView ) {
		var openedClass = 'elementor-open',
			sectionClicked = childView.model.get( 'name' ),
			isSectionOpen = childView.ui.heading.hasClass( openedClass ),

			childrenUnderSection = this.children.filter( function( view ) {
				return ( ! _.isEmpty( view.model.get( 'section' ) ) );
			} );

		this.$( '.elementor-control.elementor-control-type-section .elementor-panel-heading' ).removeClass( openedClass );

		if ( isSectionOpen ) {
			// Close all open sections
			sectionClicked = '';
		} else {
			childView.ui.heading.addClass( openedClass );
		}

		_.each( childrenUnderSection, function( view ) {
			if ( view.model.get( 'section' ) !== sectionClicked ) {
				view.$el.removeClass( openedClass );
				return;
			}

			view.$el.addClass( openedClass );
		} );

		elementor.channels.data.trigger( 'scrollbar:update' );
	},

	onReloadButtonClick: function() {
		elementor.reloadPreview();
	}
} );

module.exports = EditorCompositeView;
