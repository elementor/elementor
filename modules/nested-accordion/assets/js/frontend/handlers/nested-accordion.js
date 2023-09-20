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
				accordionContent: '.e-n-accordion-item > .e-con',
			},
			default_state: 'expanded',
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

		if ( elementorFrontend.isEditMode() ) {
			this.interlaceContainers();
		}

		this.injectKeyboardHandler();
	}

	injectKeyboardHandler() {
		if ( 'nested-accordion.default' === this.getSettings( 'elementName' ) ) {
			const handler = new NestedAccordionTitleKeyboardHandler( {
				$element: this.$element,
			} );
			handler.handeTitleLinkEnterOrSpaceEvent = this.clickListener.bind( this );
			handler.handleContentElementEscapeEvents = this.handleContentElementEscapeEvents.bind( this );
			handler.handleTitleEscapeKeyEvents = this.handleTitleEscapeKeyEvents.bind( this );
			this.handler = handler;
		}
	}

	interlaceContainers() {
		const { $contentContainers, $accordionItems } = this.getDefaultElements();

		$contentContainers.each( ( index, element ) => {
			$accordionItems[ index ].appendChild( element );
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

	closeAllItems( $items, $titles ) {
		$titles.each( ( index, title ) => {
			this.closeAccordionItem( $items[ index ], title );
		} );
	}

	getAnimationDuration() {
		const { size, unit } = this.getElementSettings( 'n_accordion_animation_duration' );
		return size * ( 'ms' === unit ? 1 : 1000 );
	}

	handleContentElementEscapeEvents( event ) {
		const detailsNode = this.findParentDetailsNode( event.currentTarget ),
			summaryNode = detailsNode.querySelector( 'summary' );

		if ( summaryNode ) {
			summaryNode.focus();
			event.currentTarget = summaryNode;
			this.clickListener( event );
		}
	}

	handleTitleEscapeKeyEvents( event ) {
		const detailsNode = event?.currentTarget?.parentElement,
			isOpen = detailsNode?.open;

		if ( isOpen ) {
			this.clickListener( event );
		}
	}

	findParentDetailsNode( el ) {
		while ( el ) {
			if ( 'details' === el.nodeName.toLowerCase() ) {
				return el;
			}
			el = el.parentElement;
		}
		return null;
	}
}
