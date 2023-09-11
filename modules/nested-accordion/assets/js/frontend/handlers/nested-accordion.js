import Base from 'elementor/assets/dev/js/frontend/handlers/base';

export default class NestedAccordion extends Base {
	constructor( ...args ) {
		super( ...args );

		this.animations = new Map();
		this.directionNext = 'next';
		this.directionPrevious = 'previous';
		this.focusableElementSelector = 'button, [accesskey], [contenteditable], [href], [tabindex]:not([tabindex="-1"])';
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
	}

	interlaceContainers() {
		const { $contentContainers, $accordionItems } = this.getDefaultElements();

		$contentContainers.each( ( index, element ) => {
			$accordionItems[ index ].appendChild( element );
		} );
	}

	bindEvents() {
		this.elements.$accordionTitles.on( 'click', this.clickListener.bind( this ) );
		this.elements.$accordionTitles.on( 'keydown', this.handleTitleKeyboardNavigation.bind( this ) );
	}

	isDirectionKey( event ) {
		const directionKeys = [ 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End' ];
		return directionKeys.includes( event.key );
	}

	isActivationKey( event ) {
		const activationKeys = [ 'Enter', ' ' ];
		return activationKeys.includes( event.key );
	}

	handleTitleKeyboardNavigation( event ) {
		if ( this.isDirectionKey( event ) ) {
			event.preventDefault();

			const currentTitle = event.currentTarget;
			const $accordionTitles = this.elements.$accordionTitles;
			let index = $accordionTitles.index( currentTitle );

			switch ( event.key ) {
				case 'ArrowRight':
					index = elementorFrontendConfig.is_rtl
						? ( index - 1 + $accordionTitles.length ) % $accordionTitles.length
						: ( index + 1 ) % $accordionTitles.length;
					break;
				case 'ArrowLeft':
					index = elementorFrontendConfig.is_rtl
						? ( index + 1 ) % $accordionTitles.length
						: ( index - 1 + $accordionTitles.length ) % $accordionTitles.length;
					break;
				case 'ArrowUp':
					index = ( index - 1 + $accordionTitles.length ) % $accordionTitles.length;
					break;
				case 'ArrowDown':
					index = ( index + 1 ) % $accordionTitles.length;
					break;
				case 'Home':
					index = 0;
					break;
				case 'End':
					index = $accordionTitles.length - 1;
					break;
				default:
					break;
			}

			const nextTitle = $accordionTitles.get( index );
			nextTitle.focus();

			event.stopPropagation();
		} else if ( this.isActivationKey( event ) ) {
			event.preventDefault();

			// Trigger the click event to toggle the accordion state
			this.clickListener( event );
		} else if ( 'Escape' === event.key ) {
			event.preventDefault();

			const summaryNode = event.currentTarget,
				isOpen = summaryNode.parentElement.open;

			if ( isOpen ) {
				this.clickListener( event );
			}
		}
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
