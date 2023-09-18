import Base from 'elementor/assets/dev/js/frontend/handlers/base';

export default class NestedAccordion extends Base {
	constructor( ...args ) {
		super( ...args );

		this.animations = new Map();
	}

	getDefaultSettings() {
		const defaultSettings = super.getDefaultSettings();

		// Accessibility settings
		defaultSettings.selectors = defaultSettings.selectors || {};
		defaultSettings.selectors.itemTitle = '.e-n-accordion-item-title';
		defaultSettings.selectors.itemContainer = '.e-n-accordion-item > .e-con';
		defaultSettings.ariaAttributes = defaultSettings.selectors.ariaAttributes || {};
		defaultSettings.ariaAttributes.titleStateAttribute = 'aria-expanded';
		defaultSettings.ariaAttributes.activeTitleSelector = '[aria-expanded="true"]';
		defaultSettings.datasets = defaultSettings.datasets || {};
		defaultSettings.datasets.titleIndex = 'data-accordion-index';

		// Widget settings
		const settings = {
			selectors: {
				accordion: '.e-n-accordion',
				accordionContentContainers: '.e-n-accordion > .e-con',
				accordionItems: '.e-n-accordion-item',
				accordionItemTitles: '.e-n-accordion-item-title',
				accordionContent: '.e-n-accordion-item > .e-con',
			},
			default_state: 'expanded',
		};

		defaultSettings.selectors = { ...defaultSettings.selectors, ...settings.selectors };
		defaultSettings.default_state = settings.default_state;

		return defaultSettings;
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$accordion: this.findElement( selectors.accordion ),
			$contentContainers: this.findElement( selectors.accordionContentContainers ),
			$accordionItems: this.findElement( selectors.accordionItems ),
			$accordionTitles: this.findElement( selectors.accordionItemTitles ),
			$accordionContent: this.findElement( selectors.accordionContent ),
		};
	}

	getKeyboardNavigationSettings() {
		return this.getSettings();
	}

	onInit( ...args ) {
		super.onInit( ...args );

		if ( elementorFrontend.isEditMode() ) {
			this.interlaceContainers();
		}

		if ( 'nested-accordion.default' === this.getSettings( 'elementName' ) ) {
			const handler = new elementorModules.frontend.handlers.NestedTitleKeyboardHandler( this.getKeyboardNavigationSettings() );
			handler.handeTitleLinkEnterOrSpaceEvent = this.clickListener.bind( this ); // To support enter and space keys
		}
	}

	interlaceContainers() {
		const { $contentContainers, $accordionItems } = this.getDefaultElements();

		$contentContainers.each( ( index, element ) => {
			$accordionItems[ index ].appendChild( element );

			const summary = $accordionItems[ index ].querySelector( 'summary' ),
				itemId = summary.getAttribute( 'aria-controls' );

			element.setAttribute( 'role', 'region' );
			element.setAttribute( 'aria-labelledby', itemId );
		} );
	}

	bindEvents() {
		this.elements.$accordionTitles.on( 'click', this.clickListener.bind( this ) );
	}

	unbindEvents() {
		this.elements.$accordionTitles.off();
	}

	clickListener( event ) {
		event.preventDefault();

		const accordionItem = event.currentTarget.parentElement,
			settings = this.getSettings(),
			accordionContent = accordionItem.querySelector( settings.selectors.accordionContent ),
			{ max_items_expended: maxItemsExpended } = this.getElementSettings(),
			{ $accordionTitles, $accordionItems } = this.elements;

		if ( 'one' === maxItemsExpended ) {
			this.closeAllItems( $accordionItems, $accordionTitles );
		}

		if ( ! accordionItem.open ) {
			this.prepareOpenAnimation( accordionItem, event.currentTarget, accordionContent );
		} else {
			this.closeAccordionItem( accordionItem, event.currentTarget );
		}
	}

	animateItem( accordionItem, startHeight, endHeight, isOpen ) {
		accordionItem.style.overflow = 'hidden';
		let animation = this.animations.get( accordionItem );

		if ( animation ) {
			animation.cancel();
		}

		animation = accordionItem.animate(
			{ height: [ startHeight, endHeight ] },
			{ duration: this.getAnimationDuration() },
		);

		animation.onfinish = () => this.onAnimationFinish( accordionItem, isOpen );
		this.animations.set( accordionItem, animation );

		const summaryNode = accordionItem.querySelector( 'summary' );
		if ( summaryNode ) {
			summaryNode.setAttribute( 'aria-expanded', isOpen );
		}
	}

	closeAccordionItem( accordionItem, accordionItemTitle ) {
		const startHeight = `${ accordionItem.offsetHeight }px`,
			endHeight = `${ accordionItemTitle.offsetHeight }px`;

		this.animateItem( accordionItem, startHeight, endHeight, false );
	}

	prepareOpenAnimation( accordionItem, accordionItemTitle, accordionItemContent ) {
		accordionItem.style.overflow = 'hidden';
		accordionItem.style.height = `${ accordionItem.offsetHeight }px`;
		accordionItem.open = true;
		window.requestAnimationFrame( () => this.openAccordionItem( accordionItem, accordionItemTitle, accordionItemContent ) );
	}

	openAccordionItem( accordionItem, accordionItemTitle, accordionItemContent ) {
		const startHeight = `${ accordionItem.offsetHeight }px`,
			endHeight = `${ accordionItemTitle.offsetHeight + accordionItemContent.offsetHeight }px`;

		this.animateItem( accordionItem, startHeight, endHeight, true );
	}

	onAnimationFinish( accordionItem, isOpen ) {
		accordionItem.open = isOpen;
		this.animations.set( accordionItem, null );
		accordionItem.style.height = accordionItem.style.overflow = '';
	}

	closeAllItems( $items, $titles ) {
		$titles.each( ( index, title ) => {
			this.closeAccordionItem( $items[ index ], title );
		} );
	}

	getAnimationDuration() {
		const { size, unit } = this.getElementSettings( 'n_accordion_animation_duration' );
		return size * ( 'ms' === unit ? 1 : 1000 );
	}
}
