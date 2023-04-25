import ControlsPopover from './controls-popover';

var ControlsStack;

ControlsStack = Marionette.CompositeView.extend( {
	classes: {
		popover: 'elementor-controls-popover',
	},

	activeTab: null,

	activeSection: null,

	className() {
		return 'elementor-controls-stack';
	},

	templateHelpers() {
		return {
			elementData: elementor.getElementData( this.model ),
		};
	},

	childViewOptions() {
		return {
			// TODO: elementSettingsModel is deprecated since 2.8.0.
			elementSettingsModel: this.model,
		};
	},

	ui() {
		return {
			tabs: '.elementor-panel-navigation-tab',
			reloadButton: '.elementor-update-preview-button',
		};
	},

	events() {
		return {
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

	initialize( options ) {
		this.initCollection();

		if ( options.tab ) {
			this.activeTab = options.tab;
			this.activateFirstSection();
		}

		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
	},

	initCollection() {
		this.collection = new Backbone.Collection( _.values( elementor.mergeControlsSettings( this.getOption( 'controls' ) ) ) );
	},

	filter( controlModel ) {
		if ( controlModel.get( 'tab' ) !== this.activeTab ) {
			return false;
		}

		if ( 'section' === controlModel.get( 'type' ) ) {
			return true;
		}

		var section = controlModel.get( 'section' );

		return ! section || section === this.activeSection;
	},

	getControlViewByModel( model ) {
		return this.children.findByModelCid( model.cid );
	},

	getControlViewByName( name ) {
		return this.getControlViewByModel( this.getControlModel( name ) );
	},

	getControlModel( name ) {
		return this.collection.findWhere( { name } );
	},

	isVisibleSectionControl( sectionControlModel ) {
		return this.activeTab === sectionControlModel.get( 'tab' );
	},

	activateTab( tab ) {
		this.activeTab = tab;

		this.activateFirstSection();

		this._renderChildren();

		return this;
	},

	activateSection( sectionName ) {
		this.activeSection = sectionName;

		return this;
	},

	activateFirstSection() {
		var self = this;

		var sectionControls = self.collection.filter( function( controlModel ) {
			return 'section' === controlModel.get( 'type' ) && self.isVisibleSectionControl( controlModel );
		} );

		let sectionToActivate;

		if ( ! sectionControls[ 0 ] ) {
			self.activeSection = null;

			sectionToActivate = null;
		} else {
			sectionToActivate = sectionControls[ 0 ].get( 'name' );
		}

		var preActivatedSection = sectionControls.filter( function( controlModel ) {
			return self.activeSection === controlModel.get( 'name' );
		} );

		if ( preActivatedSection[ 0 ] ) {
			return;
		}

		self.activateSection( sectionToActivate );

		return this;
	},

	getChildView( item ) {
		var controlType = item.get( 'type' );

		return elementor.getControlView( controlType );
	},

	getNamespaceArray() {
		return [ elementor.getPanelView().getCurrentPageName() ];
	},

	openActiveSection() {
		var activeSection = this.activeSection,
			activeSectionView = this.children.filter( function( view ) {
				return activeSection === view.model.get( 'name' );
			} );

		if ( activeSectionView[ 0 ] ) {
			activeSectionView[ 0 ].$el.addClass( 'e-open' );

			const eventNamespace = this.getNamespaceArray();

			eventNamespace.push( activeSection, 'activated' );

			elementor.channels.editor.trigger( eventNamespace.join( ':' ), this );
		}
	},

	onRenderCollection() {
		this.openActiveSection();

		ControlsStack.handlePopovers( this );
	},

	onModelDestroy() {
		this.destroy();
	},

	onReloadButtonClick() {
		elementor.reloadPreview();
	},

	onDeviceModeChange() {
		if ( 'desktop' === elementor.channels.deviceMode.request( 'currentMode' ) ) {
			this.$el.removeClass( 'elementor-responsive-switchers-open' );
		}
	},

	onChildviewControlSectionClicked( childView ) {
		var isSectionOpen = childView.$el.hasClass( 'e-open' );

		this.activateSection( isSectionOpen ? null : childView.model.get( 'name' ) );

		this._renderChildren();
	},

	onChildviewResponsiveSwitcherClick( childView, device ) {
		if ( 'desktop' === device ) {
			this.$el.toggleClass( 'elementor-responsive-switchers-open' );
		}
	},
}, {
	handlePopovers( view ) {
		let popover;

		view.popovers = [];

		this.removePopovers( view );

		view.children.each( ( control ) => {
			if ( popover ) {
				popover.addChild( control );
			}

			const popoverData = control.model.get( 'popover' );

			if ( ! popoverData ) {
				return;
			}

			if ( popoverData.start ) {
				popover = new ControlsPopover( control );

				view.popovers.push( popover );
			}

			if ( popoverData.end ) {
				popover = null;
			}
		} );
	},
	removePopovers( view ) {
		view.popovers.forEach( ( popover ) => popover.destroy() );
	},
} );

export default ControlsStack;
