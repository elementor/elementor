var ControlsStack;

ControlsStack = Marionette.CompositeView.extend( {
	className: 'elementor-panel-controls-stack',

	classes: {
		popup: 'elementor-controls-popup',
		popupToggle: 'elementor-control-popup-starter-toggle'
	},

	activeTab: null,

	activeSection: null,

	templateHelpers: function() {
		return {
			elementData: elementor.getElementData( this.model )
		};
	},

	ui: function() {
		return {
			tabs: '.elementor-panel-navigation-tab',
			reloadButton: '.elementor-update-preview-button'
		};
	},

	events: function() {
		return {
			'click': 'onClick',
			'click @ui.tabs': 'onClickTabControl',
			'click @ui.reloadButton': 'onReloadButtonClick'
		};
	},

	modelEvents: {
		'destroy': 'onModelDestroy'
	},

	behaviors: {
		HandleInnerTabs: {
			behaviorClass: require( 'elementor-behaviors/inner-tabs' )
		}
	},

	initialize: function() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
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

	isVisibleSectionControl: function( sectionControlModel ) {
		return this.activeTab === sectionControlModel.get( 'tab' );
	},

	activateTab: function( $tab ) {
		var self = this,
			activeTab = this.activeTab = $tab.data( 'tab' );

		this.ui.tabs.removeClass( 'active' );

		$tab.addClass( 'active' );

		var sectionControls = this.collection.filter( function( controlModel ) {
			return 'section' === controlModel.get( 'type' ) && self.isVisibleSectionControl( controlModel );
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

	handlePopups: function() {
		var self = this,
			popupStarted = false,
			$popup;

		self.removePopups();

		self.children.each( function( child ) {
			if ( popupStarted ) {
				$popup.append( child.$el );
			}

			var popup = child.model.get( 'popup' );

			if ( popup ) {
				if ( popup.start ) {
					popupStarted = true;

					$popup = jQuery( '<div>', { 'class': self.classes.popup } );

					child.$el.before( $popup );

					$popup.append( child.$el );
				} else if ( popup.end ) {
					popupStarted = false;
				}
			}
		} );
	},

	hidePopups: function() {
		this.$el.find( '.' + this.classes.popup ).hide();
	},

	removePopups: function() {
		this.$el.find( '.' + this.classes.popup ).remove();
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

	onRenderCollection: function() {
		this.openActiveSection();

		this.handlePopups();
	},

	onRenderTemplate: function() {
		this.activateTab( this.ui.tabs.eq( 0 ) );
	},

	onModelDestroy: function() {
		this.destroy();
	},

	onClick: function( event ) {
		if ( jQuery( event.target ).closest( '.' + this.classes.popup + ',.' + this.classes.popupToggle ).length ) {
			return;
		}

		this.hidePopups();
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

	onReloadButtonClick: function() {
		elementor.reloadPreview();
	},

	onDeviceModeChange: function() {
		this.$el.removeClass( 'elementor-responsive-switchers-open' );
	},

	onChildviewControlSectionClicked: function( childView ) {
		var isSectionOpen = childView.ui.heading.hasClass( 'elementor-open' );

		this.activateSection( isSectionOpen ? null : childView.model.get( 'name' ) );

		this._renderChildren();
	},

	onChildviewResponsiveSwitcherClick: function( childView, device ) {
		if ( 'desktop' === device ) {
			this.$el.toggleClass( 'elementor-responsive-switchers-open' );
		}
	}
} );

module.exports = ControlsStack;
