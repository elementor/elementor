import Base from 'elementor/assets/dev/js/frontend/handlers/base';

export default class NestedAccordion extends Base {
	constructor( ...args ) {
		super( ...args );

		this.animation = null;
		this.isClosing = false;
		this.isExpanding = false;
	}
	getDefaultSettings() {
		return {
			selectors: {
				accordion: '.e-n-accordion',
				accordionContentContainers: '.e-n-accordion > .e-con',
				accordionItems: '.e-n-accordion-item',
				accordionItemTitles: '.e-n-accordion-item-title',
				accordionContent: '.e-n-accordion-item > .elementor-element',
			},
			default_state: 'first_expended',
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

		const { $titles, $items, $accordionContent } = this.getDefaultElements(),
			{ default_state: currentState } = this.getElementSettings(),
			{ default_state: defaultState } = this.getDefaultSettings();

		if ( currentState === defaultState ) {
			this.open( $items[ 0 ], $titles[ 0 ], $accordionContent[ 0 ] );
		} else {
			$items.each( ( _, item ) => item.removeAttribute( 'open' ) );
		}
	}

	bindEvents() {
		this.bindAnimationListeners();
	}

	unbindEvents() {
		this.removeAnimationListeners();
	}

	bindAnimationListeners() {
		const { $titles, $items, $accordionContent } = this.getDefaultElements();

		$titles.each( ( index, title ) => {
			title.addEventListener( 'click', ( e ) => {
				this.clickListener( e, $items, $accordionContent, index, title );
			} );
		} );
	}

	clickListener( e, $items, $accordionContent, index, title ) {
		e.preventDefault();

		const detailsNode = $items[ index ],
			contentNode = $accordionContent[ index ];

		if ( this.isClosing || ! $items[ index ].open ) {
			this.open( detailsNode, title, contentNode );
		} else if ( this.isExpanding || $items[ index ].open ) {
			this.shrink( detailsNode, title );
		}
	}

	shrink( el, summary ) {
		el.style.overflow = 'hidden';

		this.isClosing = true;

		const startHeight = `${ el.offsetHeight }px`,
			endHeight = `${ summary.offsetHeight }px`;

		if ( this.animation ) {
			this.animation.cancel();
		}

		this.animation = el.animate( {
			height: [ startHeight, endHeight ],
		}, {
			duration: 1500,
			easing: 'ease-out',
		} );

		this.animation.onfinish = () => this.onAnimationFinish( el, false );
		this.animation.oncancel = () => this.isClosing = false;
	}

	open( el, summary, content ) {
		el.style.overflow = 'hidden';
		el.style.height = `${ el.offsetHeight }px`;
		el.open = true;
		window.requestAnimationFrame( () => this.expand( el, summary, content ) );
	}

	expand( el, summary, content ) {
		this.isExpanding = true;

		const startHeight = `${ el.offsetHeight }px`,
			endHeight = `${ summary.offsetHeight + content.offsetHeight }px`;

		if ( this.animation ) {
			this.animation.cancel();
		}

		this.animation = el.animate( {
			height: [ startHeight, endHeight ],
		}, {
			duration: 1500,
			easing: 'ease-out',
		} );

		this.animation.onfinish = () => this.onAnimationFinish( el, true );
		this.animation.oncancel = () => this.isExpanding = false;
	}

	onAnimationFinish( el, open ) {
		el.open = open;
		this.animation = null;
		this.isClosing = false;
		this.isExpanding = false;
		el.style.height = el.style.overflow = '';
	}

	removeAnimationListeners() {
		const { $titles, $items, $accordionContent } = this.getDefaultElements();

		$titles.each( ( index, title ) => {
			title.removeEventListener( 'click', ( e ) => {
				this.clickListener( e, $items, $accordionContent, index, title );
			} );
		} );
	}
}
