var PanelElementsElementsCollection = require( '../collections/elements' ),
	PanelElementsCategoryView;

const COMMUNITY_LIBRARY_STORAGE_KEY = 'elementor_user_interactions/angie_community_library';
const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';

PanelElementsCategoryView = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-panel-elements-category',

	className: 'elementor-panel-category',

	ui: {
		title: '.elementor-panel-category-title',
		items: '.elementor-panel-category-items',
		chip: '.elementor-panel-heading-category-chip',
	},

	events: {
		'click @ui.title': 'onTitleClick',
		'click @ui.chip': 'onChipClick',
		'click .elementor-panel-custom-widgets__cta--heading': 'onCustomWidgetsMenuOpen',
		'click .elementor-panel-custom-widgets-community-promo__button': 'onCustomWidgetsCommunityPromoClick',
		'click .elementor-panel-custom-widgets-community-promo__dismiss': 'onCommunityPromoDismiss',
		'click .elementor-panel-heading-promotion a': 'onPromotionLinkClick',
	},

	id() {
		return 'elementor-panel-category-' + this.model.get( 'name' );
	},

	childView: require( 'elementor-panel/pages/elements/views/element' ),

	childViewContainer: '.elementor-panel-category-items',

	initialize() {
		let items = this.model.get( 'items' ) || [];

		switch ( this.model.get( 'sort' ) ) {
			case 'a-z':
				items = items.sort( ( a, b ) => ( a.get( 'title' ) > b.get( 'title' ) ? 1 : -1 ) );
				break;
		}

		this.collection = new PanelElementsElementsCollection( items );

		this.onCreateWidgetEvent = this.onCreateWidgetEvent.bind( this );
		window.addEventListener( CREATE_WIDGET_EVENT, this.onCreateWidgetEvent );
	},

	onDestroy() {
		window.removeEventListener( CREATE_WIDGET_EVENT, this.onCreateWidgetEvent );
	},

	onCreateWidgetEvent( event ) {
		if ( ! event.detail?.openCommunityLibrary ) {
			return;
		}

		setCommunityLibraryState( { was_interacted: true } );
		this.applyCommunityPromoState();
	},

	behaviors() {
		return elementor.hooks.applyFilters( 'panel/category/behaviors', {}, this );
	},

	onRender() {
		let isActive = elementor.channels.panelElements.request(
			'category:' + this.model.get( 'name' ) + ':active',
		);

		if ( undefined === isActive ) {
			isActive = this.model.get( 'defaultActive' );
		}

		if ( ! this.collection.length && this.model.get( 'hideIfEmpty' ) ) {
			this.$el.css( 'display', 'none' );
		}

		if ( isActive ) {
			this.$el.addClass( 'elementor-active' );
		} else {
			this.ui.items.css( 'display', 'none' );
		}

		this.applyCommunityPromoState();
	},

	applyCommunityPromoState() {
		const $promo = this.$el.find( '.elementor-panel-custom-widgets-community-promo' );
		if ( ! $promo.length ) {
			return;
		}

		const state = getCommunityLibraryState();

		if ( state.was_dismissed ) {
			$promo.hide();
			return;
		}

		if ( state.was_interacted ) {
			const $icon = $promo.find( '.elementor-panel-custom-widgets-community-promo__icon' );
			const $dismiss = $promo.find( '.elementor-panel-custom-widgets-community-promo__dismiss' );
			$icon.hide();
			$dismiss.show();
		}
	},

	onTitleClick() {
		this.toggle();

		elementorCommon.eventsManager.dispatchEvent(
			elementorCommon.eventsManager.config.names[ this.model.get( 'name' ) ]?.v1,
			{
				location: elementorCommon.eventsManager.config.locations.widgetPanel,
				secondaryLocation:
          elementorCommon.eventsManager.config.secondaryLocations[ this.model.get( 'name' ) ],
				trigger: elementorCommon.eventsManager.config.triggers.accordionClick,
				element: elementorCommon.eventsManager.config.elements.accordionSection,
			},
		);
	},

	toggle( state, animate = true ) {
		var $items = this.ui.items,
			activeClass = 'elementor-active',
			isActive = undefined !== state ? ! state : this.$el.hasClass( activeClass ),
			visibilityFn = isActive ? 'hide' : 'show',
			slideFn = isActive ? 'slideUp' : 'slideDown',
			updateScrollbar = () => elementor.getPanelView().updateScrollbar();

		elementor.channels.panelElements.reply(
			'category:' + this.model.get( 'name' ) + ':active',
			! isActive,
		);

		this.$el.toggleClass( activeClass, ! isActive );

		if ( animate ) {
			$items[ slideFn ]( 300, updateScrollbar );
		} else {
			$items[ visibilityFn ]( 0, updateScrollbar );
		}
	},

	onChipClick( event ) {
		event.stopPropagation();

		document.dispatchEvent(
			new CustomEvent( 'alphachip:open', {
				detail: { target: this.$el },
			} ),
		);
	},

	onCustomWidgetsMenuOpen( event ) {
		event.stopPropagation();

		const buttonRect = event.currentTarget.getBoundingClientRect();

		window.dispatchEvent(
			new CustomEvent( 'elementor/editor/open-create-widget-menu', {
				detail: {
					anchorPosition: {
						top: buttonRect.bottom,
						left: buttonRect.left,
					},
				},
			} ),
		);
	},

	onPromotionLinkClick( event ) {
		event.stopPropagation();
	},

	onCustomWidgetsCommunityPromoClick( event ) {
		event.stopPropagation();

		window.dispatchEvent(
			new CustomEvent( CREATE_WIDGET_EVENT, {
				detail: {
					entry_point: 'widgets_panel',
					openCommunityLibrary: true,
				},
			} ),
		);
	},

	onCommunityPromoDismiss( event ) {
		event.stopPropagation();

		setCommunityLibraryState( { was_dismissed: true } );

		var $promo = this.$el.find( '.elementor-panel-custom-widgets-community-promo' );
		$promo.hide();
	},
} );

module.exports = PanelElementsCategoryView;

function getCommunityLibraryState() {
	const stored = localStorage.getItem( COMMUNITY_LIBRARY_STORAGE_KEY );
	if ( stored ) {
		return JSON.parse( stored );
	}

	return { was_interacted: false, was_dismissed: false };
}

function setCommunityLibraryState( newState ) {
	const current = getCommunityLibraryState();
	const updated = { ...current, ...newState };
	localStorage.setItem( COMMUNITY_LIBRARY_STORAGE_KEY, JSON.stringify( updated ) );
}
