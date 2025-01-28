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
		};
	}

	onInit() {
		const elements = this.getDefaultElements();

		this.horizontalParentContainer = elements.horizontalParentContainer;
		this.horizontalContainer = elements.horizontalContainer;

		if ( ! this.horizontalContainer ) {
			return;
		}

		this.scrollWidth = this.horizontalContainer.scrollWidth;
		this.wrapperWidth = this.horizontalContainer.getBoundingClientRect().width;
		this.offsetTop = this.horizontalContainer.getBoundingClientRect().top;
		this.offsetLeft = this.horizontalContainer.getBoundingClientRect().left;
		this.adminBarHeight = this.getAdminBarHeight();

		const containerHeight = this.horizontalContainer.getBoundingClientRect().height;
		const scrollHeight = this.wrapperWidth + containerHeight;

		this.horizontalParentContainer.style.setProperty( '--horizontal-scroll-height', `${ scrollHeight }px` );
		document.addEventListener( 'scroll', this.horizontalScroll.bind( this ) );
	}

	getAdminBarHeight() {
		const adminBar = document.getElementById( 'wpadminbar' );
		return !! adminBar ? adminBar.offsetHeight : 0;
	}

	horizontalScroll() {
		const stickyPosition = this.horizontalContainer.getBoundingClientRect().top;

		if ( stickyPosition > 1 ) {
			return;
		}

		const relativeScrolledDistance = this.horizontalContainer.offsetTop;
		const scrolledDistance = this.offsetTop - this.adminBarHeight - relativeScrolledDistance;
		const scrollSpeed = this.scrollWidth / this.wrapperWidth;

		this.horizontalContainer.scrollLeft = -0.85 * scrollSpeed * scrolledDistance + this.offsetLeft;
	}
}
