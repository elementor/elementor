export default class HorizontalScroll extends elementorModules.frontend.handlers.Base {
	__construct( ...args ) {
		super.__construct( ...args );
	}

	getDefaultSettings() {
		return {
			selectors: {
				horizontalParentContainer: '.e-con-horizontal-sticky',
				horizontalContainer: '.e-con-horizontal',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			horizontalParentContainer: this.$element[ 0 ].closest( selectors.horizontalParentContainer ),
			horizontalContainer: this.$element[ 0 ].closest( selectors.horizontalContainer ),
		}
	}

	onInit() {
		const elements = this.getDefaultElements();

		this.horizontalParentContainer = elements.horizontalParentContainer;
		this.horizontalContainer = elements.horizontalContainer;

		if ( ! this.horizontalParentContainer ) {
			return;
		}

		this.scrollWidth = this.horizontalContainer.scrollWidth;
		this.verticalScrollHeight = this.horizontalParentContainer.getBoundingClientRect().width + this.horizontalContainer.getBoundingClientRect().height;
		this.horizontalParentContainer.style.setProperty( '--horizontal-scroll-height', `${ this.verticalScrollHeight }px` );

		document.addEventListener( 'scroll', this.horizontalScroll.bind( this ) );
	}

	horizontalScroll() {
		const stickyPosition = this.horizontalContainer.getBoundingClientRect().top;

		console.log( 'stickyPosition', stickyPosition );

		if ( stickyPosition > 1  ) {
			return;
		}

		const scrolledDistance = this.horizontalParentContainer.getBoundingClientRect().top;
		this.horizontalContainer.scrollLeft = ( this.scrollWidth / this.verticalScrollHeight ) * ( -scrolledDistance ) * 0.85;


		console.log( 'scrolledDistance', scrolledDistance );
		console.log( 'scrollWidth', this.scrollWidth );
		console.log( 'verticalScrollHeight', this.verticalScrollHeight );
		console.log( 'scroll someting', ( this.scrollWidth / this.verticalScrollHeight ) );
	}
}
