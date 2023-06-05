import Base from 'elementor/assets/dev/js/frontend/handlers/base';

const ANIMATION_DURATION = 500;

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
	}

	interlaceContainers() {
		const { $contentContainers, $accordionItems } = this.getDefaultElements();

		$contentContainers.each( ( index, element ) => {
			$accordionItems[ index ].appendChild( element );
		} );
	}

	bindEvents() {
		setTimeout( this.bindAnimationListeners.bind( this ), 200 ); // Wait for content to load before binding events.
	}

	unbindEvents() {
		this.removeAnimationListeners();
	}

	bindAnimationListeners() {
		const { $accordionTitles, $accordionItems, $accordionContent } = this.getDefaultElements();

		$accordionTitles.each( ( index, title ) => {
			const clickListener = this.clickListener.bind( this, $accordionItems, $accordionContent, index, title );
			title.addEventListener( 'click', clickListener );
			title.clickListener = clickListener; // Save reference for later removal
		} );
	}

	clickListener( $accordionItems, $accordionContent, index, title, e ) {
		e.preventDefault();

		const item = $accordionItems[ index ],
			content = $accordionContent[ index ];

		if ( ! item.open ) {
			this.prepareOpenAnimation( item, title, content );
		} else {
			this.closeAccordionItem( item, title );
		}
	}

	animateItem( item, startHeight, endHeight, isOpen ) {
		item.style.overflow = 'hidden';
		let animation = this.animations.get( item );

		if ( animation ) {
			animation.cancel();
		}

		animation = item.animate( { height: [ startHeight, endHeight ] }, { duration: ANIMATION_DURATION } );
		animation.onfinish = () => this.onAnimationFinish( item, isOpen );
		this.animations.set( item, animation );
	}

	closeAccordionItem( item, itemTitle ) {
		const startHeight = `${ item.offsetHeight }px`,
			endHeight = `${ itemTitle.offsetHeight }px`;

		this.animateItem( item, startHeight, endHeight, false );
	}

	prepareOpenAnimation( item, title, content ) {
		item.style.overflow = 'hidden';
		item.style.height = `${ item.offsetHeight }px`;
		item.open = true;
		window.requestAnimationFrame( () => this.openAccordionItem( item, title, content ) );
	}

	openAccordionItem( item, title, content ) {
		const startHeight = `${ item.offsetHeight }px`,
			endHeight = `${ title.offsetHeight + content.offsetHeight }px`;

		this.animateItem( item, startHeight, endHeight, true );
	}

	onAnimationFinish( item, isOpen ) {
		item.open = isOpen;
		this.animations.set( item, null );
		item.style.height = item.style.overflow = '';
	}

	removeAnimationListeners() {
		const { $accordionTitles } = this.getDefaultElements();

		$accordionTitles.each( ( _, title ) => {
			title.removeEventListener( 'click', title.clickListener );
		} );
	}
}
