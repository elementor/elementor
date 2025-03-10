import Base from 'elementor-frontend/handlers/base';
import NestedAccordionTitleKeyboardHandler from './nested-accordion-title-keyboard-handler';

export default class NestedAccordion extends Base {
	constructor( ...args ) {
		super( ...args );

		this.animations = new Map();
	}

	getDefaultSettings() {
		return {
			selectors: {
				accordion: '.e-n-accordion',
				accordionContentContainers: '.e-n-accordion > .e-con',
				accordionItems: '.e-n-accordion-item',
				accordionItemTitles: '.e-n-accordion-item-title',
				accordionItemTitlesText: '.e-n-accordion-item-title-text',
				accordionContent: '.e-n-accordion-item > .e-con',
				directAccordionItems: ':scope > .e-n-accordion-item',
				directAccordionItemTitles: ':scope > .e-n-accordion-item > .e-n-accordion-item-title',
			},
			default_state: 'expanded',
			attributes: {
				index: 'data-accordion-index',
				ariaLabelledBy: 'aria-labelledby',
			},
		};
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

	onInit( ...args ) {
		super.onInit( ...args );

		this.injectKeyboardHandler();
	}

	injectKeyboardHandler() {
		if ( 'nested-accordion.default' === this.getSettings( 'elementName' ) ) {
			new NestedAccordionTitleKeyboardHandler( {
				$element: this.$element,
				toggleTitle: this.clickListener.bind( this ),
			} );
		}
	}

	linkContainer( event ) {
		const { container, index, targetContainer, action: { type } } = event.detail,
			view = container.view.$el,
			id = container.model.get( 'id' ),
			currentId = this.$element.data( 'id' );

		if ( id === currentId ) {
			const { $accordionItems } = this.getDefaultElements();

			let accordionItem, contentContainer;

			switch ( type ) {
				case 'move':
					[ accordionItem, contentContainer ] = this.move( view, index, targetContainer, $accordionItems );
					break;
				case 'duplicate':
					[ accordionItem, contentContainer ] = this.duplicate( view, index, targetContainer, $accordionItems );
					break;
				default:
					break;
			}

			if ( undefined !== accordionItem ) {
				accordionItem.appendChild( contentContainer );
			}

			this.updateIndexValues();
			this.updateListeners( view );

			elementor.$preview[ 0 ].contentWindow.dispatchEvent( new CustomEvent( 'elementor/elements/link-data-bindings' ) );
		}
	}

	move( view, index, targetContainer, accordionItems ) {
		return [ accordionItems[ index ], targetContainer.view.$el[ 0 ] ];
	}

	duplicate( view, index, targetContainer, accordionItems ) {
		return [ accordionItems[ index + 1 ], targetContainer.view.$el[ 0 ] ];
	}

	updateIndexValues() {
		const { $accordionContent, $accordionItems } = this.getDefaultElements(),
			settings = this.getSettings(),
			itemIdBase = $accordionItems[ 0 ].getAttribute( 'id' ).slice( 0, -1 );

		$accordionItems.each( ( index, element ) => {
			element.setAttribute( 'id', `${ itemIdBase }${ index }` );
			element.querySelector( settings.selectors.accordionItemTitles ).setAttribute( settings.attributes.index, index + 1 );
			element.querySelector( settings.selectors.accordionItemTitles ).setAttribute( 'aria-controls', `${ itemIdBase }${ index }` );
			element.querySelector( settings.selectors.accordionItemTitlesText ).setAttribute( 'data-binding-index', index + 1 );
			$accordionContent[ index ].setAttribute( settings.attributes.ariaLabelledBy, `${ itemIdBase }${ index }` );
		} );
	}

	updateListeners( view ) {
		this.elements.$accordionTitles = view.find( this.getSettings( 'selectors.accordionItemTitles' ) );
		this.elements.$accordionItems = view.find( this.getSettings( 'selectors.accordionItems' ) );
		this.elements.$accordionTitles.on( 'click', this.clickListener.bind( this ) );
	}

	bindEvents() {
		this.elements.$accordionTitles.on( 'click', this.clickListener.bind( this ) );
		elementorFrontend.elements.$window.on( 'elementor/nested-container/atomic-repeater', this.linkContainer.bind( this ) );
	}

	unbindEvents() {
		this.elements.$accordionTitles.off();
	}

	clickListener( event ) {
		event.preventDefault();
		this.elements = this.getDefaultElements();

		const settings = this.getSettings(),
			accordionItem = event?.currentTarget?.closest( settings.selectors.accordionItems ),
			accordion = event?.currentTarget?.closest( settings.selectors.accordion ),
			itemSummary = accordionItem.querySelector( settings.selectors.accordionItemTitles ),
			accordionContent = accordionItem.querySelector( settings.selectors.accordionContent ),
			{ max_items_expended: maxItemsExpended } = this.getElementSettings(),
			directAccordionItems = accordion.querySelectorAll( settings.selectors.directAccordionItems ),
			directAccordionItemTitles = accordion.querySelectorAll( settings.selectors.directAccordionItemTitles );

		if ( 'one' === maxItemsExpended ) {
			this.closeAllItems( directAccordionItems, directAccordionItemTitles );
		}

		if ( ! accordionItem.open ) {
			this.prepareOpenAnimation( accordionItem, itemSummary, accordionContent );
		} else {
			this.closeAccordionItem( accordionItem, itemSummary );
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

		accordionItem.querySelector( 'summary' )?.setAttribute( 'aria-expanded', isOpen );
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

	closeAllItems( items, titles ) {
		titles.forEach( ( title, index ) => {
			this.closeAccordionItem( items[ index ], title );
		} );
	}

	getAnimationDuration() {
		const { size, unit } = this.getElementSettings( 'n_accordion_animation_duration' );
		return size * ( 'ms' === unit ? 1 : 1000 );
	}
}
