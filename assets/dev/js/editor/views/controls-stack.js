var ControlsStack;

ControlsStack = Marionette.CompositeView.extend( {
	classes: {
		popover: 'elementor-controls-popover',
	},

	activeTab: null,

	activeSection: null,

	className: function() {
		return 'elementor-controls-stack';
	},

	templateHelpers: function() {
		return {
			elementData: elementor.getElementData( this.model ),
		};
	},

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model,
		};
	},

	ui: function() {
		return {
			tabs: '.elementor-panel-navigation-tab',
			reloadButton: '.elementor-update-preview-button',
		};
	},

	events: function() {
		return {
			'click @ui.tabs': 'onClickTabControl',
			'click @ui.reloadButton': 'onReloadButtonClick',
		};
	},

	modelEvents: {
		destroy: 'onModelDestroy',
	},

	behaviors: {
		HandleInnerTabs: {
			behaviorClass: require( 'elementor-behaviors/inner-tabs' ),
		},
	},

	initialize: function() {
		this.initCollection();

		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
	},

	initCollection: function() {
		this.collection = new Backbone.Collection( _.values( elementor.mergeControlsSettings( this.getOption( 'controls' ) ) ) );
	},

	filter: function( controlModel ) {
		if ( controlModel.get( 'tab' ) !== this.activeTab ) {
			return false;
		}

		if ( 'section' === controlModel.get( 'type' ) ) {
			return true;
		}

		var section = controlModel.get( 'section' );

		return ! section || section === this.activeSection;
	},

	getControlViewByModel: function( model ) {
		return this.children.findByModelCid( model.cid );
	},

	getControlViewByName: function( name ) {
		return this.getControlViewByModel( this.getControlModel( name ) );
	},

	getControlModel: function( name ) {
		return this.collection.findWhere( { name: name } );
	},

	isVisibleSectionControl: function( sectionControlModel ) {
		return this.activeTab === sectionControlModel.get( 'tab' );
	},

	activateTab: function( tabName ) {
		this.activeTab = tabName;

		this.ui.tabs
			.removeClass( 'elementor-active' )
			.filter( '[data-tab="' + tabName + '"]' )
			.addClass( 'elementor-active' );

		this.activateFirstSection();
	},

	activateSection: function( sectionName ) {
		this.activeSection = sectionName;
	},

	activateFirstSection: function() {
		var self = this;

		var sectionControls = self.collection.filter( function( controlModel ) {
			return 'section' === controlModel.get( 'type' ) && self.isVisibleSectionControl( controlModel );
		} );

		if ( ! sectionControls[ 0 ] ) {
			return;
		}

		var preActivatedSection = sectionControls.filter( function( controlModel ) {
			return self.activeSection === controlModel.get( 'name' );
		} );

		if ( preActivatedSection[ 0 ] ) {
			return;
		}

		self.activateSection( sectionControls[ 0 ].get( 'name' ) );
	},

	getChildView: function( item ) {
		var controlType = item.get( 'type' );

		return elementor.getControlView( controlType );
	},

	handlePopovers: function() {
		var self = this,
			popoverStarted = false,
			$popover;

		self.removePopovers();

		self.children.each( function( child ) {
			if ( popoverStarted ) {
				$popover.append( child.$el );
			}

			var popover = child.model.get( 'popover' );

			if ( ! popover ) {
				return;
			}

			if ( popover.start ) {
				popoverStarted = true;

				$popover = jQuery( '<div>', { class: self.classes.popover } );

				child.$el.before( $popover );

				$popover.append( child.$el );
			}

			if ( popover.end ) {
				popoverStarted = false;
			}
		} );
	},

	removePopovers: function() {
		this.$el.find( '.' + this.classes.popover ).remove();
	},

	getNamespaceArray: function() {
		return [ elementor.getPanelView().getCurrentPageName() ];
	},

	openActiveSection: function() {
		var activeSection = this.activeSection,
			activeSectionView = this.children.filter( function( view ) {
				return activeSection === view.model.get( 'name' );
			} );

		if ( activeSectionView[ 0 ] ) {
			activeSectionView[ 0 ].$el.addClass( 'elementor-open' );

			const eventNamespace = this.getNamespaceArray();

			eventNamespace.push( activeSection, 'activated' );

			elementor.channels.editor.trigger( eventNamespace.join( ':' ), this );
		}
	},

	onRenderCollection: function() {
		this.openActiveSection();

		this.handlePopovers();
	},

	onRenderTemplate: function() {
		this.activateTab( this.activeTab || this.ui.tabs.eq( 0 ).data( 'tab' ) );
	},

	onModelDestroy: function() {
		this.destroy();
	},

	onClickTabControl: function( event ) {
		event.preventDefault();

		elementorCommon.route.to( 'panel/editor/' + event.currentTarget.dataset.tab );

		this._renderChildren();
	},

	onReloadButtonClick: function() {
		elementor.reloadPreview();
	},

	onDeviceModeChange: function() {
		if ( 'desktop' === elementor.channels.deviceMode.request( 'currentMode' ) ) {
			this.$el.removeClass( 'elementor-responsive-switchers-open' );
		}
	},

	onChildviewControlSectionClicked: function( childView ) {
		var isSectionOpen = childView.$el.hasClass( 'elementor-open' );

		this.activateSection( isSectionOpen ? null : childView.model.get( 'name' ) );

		this._renderChildren();
	},

	onChildviewResponsiveSwitcherClick: function( childView, device ) {
		if ( 'desktop' === device ) {
			this.$el.toggleClass( 'elementor-responsive-switchers-open' );
		}
	},
} );

module.exports = ControlsStack;
