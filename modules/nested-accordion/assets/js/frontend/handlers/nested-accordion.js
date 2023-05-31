import Base from 'elementor/assets/dev/js/frontend/handlers/base';

const ANIMATION_DURATION = 500;
const OPEN_STATE = 'open';

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
			default_state: 'first_expanded',
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$accordion: this.findElement( selectors.accordion ),
			$contentContainers: this.findElement( selectors.accordionContentContainers ),
			$items: this.findElement( selectors.accordionItems ),
			$titles: this.findElement( selectors.accordionItemTitles ),
			$accordionContent: this.findElement( selectors.accordionContent ),
		};
	}

	onInit( ...args ) {
		super.onInit( ...args );

		if ( elementorFrontend.isEditMode() ) {
			this.interlaceContainers();
		}

		this.applyDefaultStateCondition();
	}

	interlaceContainers() {
		const { $contentContainers, $items } = this.getDefaultElements();

		$contentContainers.each( ( index, element ) => {
			$items[ index ].appendChild( element );
		} );
	}

	applyDefaultStateCondition() {
		if ( ! this.elements ) {
			return;
		}

		const accordionItems = this.elements.$items,
			{ default_state: currentState } = this.getElementSettings(),
			{ default_state: defaultState } = this.getDefaultSettings(),
			setItemState = ( item, isOpen ) => isOpen ? item.setAttribute( OPEN_STATE, '' ) : item.removeAttribute( OPEN_STATE );

		accordionItems.each( ( index, item ) => setItemState( item, 0 === index && currentState === defaultState ) );
	}

	bindEvents() {
		setTimeout( this.bindAnimationListeners.bind( this ), 200 ); // Wait for content to load before binding events.
	}

	unbindEvents() {
		this.removeAnimationListeners();
	}

	bindAnimationListeners() {
		const { $titles, $items, $accordionContent } = this.getDefaultElements();

		$titles.each( ( index, title ) => {
			const clickListener = this.clickListener.bind( this, $items, $accordionContent, index, title );
			title.addEventListener( 'click', clickListener );
			title.clickListener = clickListener; // Save reference for later removal
		} );
	}

	clickListener( $items, $accordionContent, index, title, e ) {
		e.preventDefault();

		const item = $items[ index ],
			content = $accordionContent[ index ];

		if ( ! item.open ) {
			this.open( item, title, content );
		} else {
			this.shrink( item, title );
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

	shrink( item, itemTitle ) {
		const startHeight = `${ item.offsetHeight }px`,
			endHeight = `${ itemTitle.offsetHeight }px`;

		this.animateItem( item, startHeight, endHeight, false );
	}

	open( item, title, content ) {
		item.style.overflow = 'hidden';
		item.style.height = `${ item.offsetHeight }px`;
		item.open = true;
		window.requestAnimationFrame( () => this.expand( item, title, content ) );
	}

	expand( item, title, content ) {
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
		const { $titles } = this.getDefaultElements();

		$titles.each( ( _, title ) => {
			title.removeEventListener( 'click', title.clickListener );
		} );
	}
}
