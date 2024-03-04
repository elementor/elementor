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
				accordionWrapper: '.e-n-accordion-item',
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
			new NestedAccordionTitleKeyboardHandler( {
				$element: this.$element,
				toggleTitle: this.clickListener.bind( this ),
			} );
		}
	}

	interlaceContainers() {
		const { $contentContainers, $accordionItems } = this.getDefaultElements();

		$contentContainers.each( ( index, element ) => {
			$accordionItems[ index ].appendChild( element );
		} );
	}

	linkContainer( event ) {
		const { container, targetIndex } = event.detail,
			view = container.view.$el,
			id = container.model.get( 'id' ),
			currentId = this.$element.data( 'id' );

		if ( id === currentId ) {
			const [ accordionItem, contentContainer ] = 'undefined' === typeof targetIndex ? this.insert( view ) : this.move( view, targetIndex );

			accordionItem.appendChild( contentContainer );

			this.updateListeners( view );
		}
	}

	insert( view ) {
		const containers = view.find( this.getSettings( 'selectors.accordionContentContainers' ) ),
			accordionItems = view.find( this.getSettings( 'selectors.accordionItems' ) ),
			contentContainer = containers[ containers.length - 1 ],
			accordionItem = accordionItems[ accordionItems.length - 1 ];

		return [ accordionItem, contentContainer ];
	}

	move( view, targetIndex ) {
		const containers = view.find( this.getSettings( 'selectors.accordionContentContainers' ) ),
			accordionItems = view.find( this.getSettings( 'selectors.accordionItems' ) );
		const { $accordionItems, $accordionContent } = this.getDefaultElements();

		if ( 'undefined' !== typeof targetIndex && targetIndex !== $accordionContent.length ) {
			return [ $accordionItems[ targetIndex ], $accordionContent[ targetIndex ] ];
		}

		return [ accordionItem, contentContainer ] = this.insert( view );
	}

	updateListeners( view ) {
		this.elements.$accordionTitles = view.find( this.getSettings( 'selectors.accordionItemTitles' ) );
		this.elements.$accordionItems = view.find( this.getSettings( 'selectors.accordionItems' ) );
		this.elements.$accordionTitles.on( 'click', this.clickListener.bind( this ) );
	}

	bindEvents() {
		this.elements.$accordionTitles.on( 'click', this.clickListener.bind( this ) );
		elementorFrontend.elements.$window.on( 'elementor/nested-container/created', this.linkContainer.bind( this ) );
	}

	unbindEvents() {
		this.elements.$accordionTitles.off();
		elementorFrontend.elements.$window.off( 'elementor/nested-container/created' );
	}

	clickListener( event ) {
		event.preventDefault();

		const settings = this.getSettings(),
			accordionItem = event?.currentTarget?.closest( settings.selectors.accordionWrapper ),
			itemSummary = accordionItem.querySelector( settings.selectors.accordionItemTitles ),
			accordionContent = accordionItem.querySelector( settings.selectors.accordionContent ),
			{ max_items_expended: maxItemsExpended } = this.getElementSettings(),
			{ $accordionTitles, $accordionItems } = this.elements;

		if ( 'one' === maxItemsExpended ) {
			this.closeAllItems( $accordionItems, $accordionTitles );
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
