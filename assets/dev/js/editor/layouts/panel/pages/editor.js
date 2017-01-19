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

	activeSection: null,

	initialize: function() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
	},

	filter: function( model ) {
		if ( model.get( 'tab' ) !== this.activeTab ) {
			return false;
		}

		if ( 'section' === model.get( 'type' ) ) {
			return true;
		}

		var section = model.get( 'section' );

		return ! section || section === this.activeSection;
	},

	activateTab: function( $tab ) {
		var activeTab = this.activeTab = $tab.data( 'tab' );

		this.ui.tabs.removeClass( 'active' );

		$tab.addClass( 'active' );

		var sectionControls = this.collection.filter( function( model ) {
			return 'section' === model.get( 'type' ) && activeTab === model.get( 'tab' );
		} );

		if ( sectionControls[0] ) {
			this.activateSection( sectionControls[0].get( 'name' ) );
		}
	},

	activateSection: function( sectionName ) {
		this.activeSection = sectionName;
	},

	getChildView: function( item ) {
		var controlType = item.get( 'type' );

		return elementor.getControlView( controlType );
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
		var self = this;

		self.activateTab( self.ui.tabs.eq( 0 ) );
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

		this.openActiveSection();
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

	openActiveSection: function() {
		var activeSection = this.activeSection,
			activeSectionView = this.children.filter( function( view ) {
			return activeSection === view.model.get( 'name' );
		} );

		if ( activeSectionView[0] ) {
			activeSectionView[0].ui.heading.addClass( 'elementor-open' );
		}
	},

	onChildviewControlSectionClicked: function( childView ) {
		var isSectionOpen = childView.ui.heading.hasClass( 'elementor-open' );

		this.activateSection( isSectionOpen ? null : childView.model.get( 'name' ) );

		this._renderChildren();
	},

	onReloadButtonClick: function() {
		elementor.reloadPreview();
	}
} );

module.exports = EditorCompositeView;
