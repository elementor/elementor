export default class AnchorLinks {
	constructor( entries, onChange ) {
		this.entries = entries;
		this.onChange = onChange;
		this.observers = [];
		this.active = new Set();
		this.onResize = this.onResize.bind( this );
	}

	initialize() {
		this.observe();
		window.addEventListener( 'resize', this.onResize );
	}

	destroy() {
		window.removeEventListener( 'resize', this.onResize );
		this.disconnect();
	}

	observe() {
		const viewportHeight = window.innerHeight;

		this.pendingReports = this.entries.length;

		this.entries.forEach( ( { item, target } ) => {
			let hasReported = false;

			const observer = new IntersectionObserver( ( [ entry ] ) => {
				if ( ! hasReported ) {
					hasReported = true;
					this.pendingReports--;
				}

				this.toggle( item, entry.isIntersecting );
			}, {
				root: null,
				rootMargin: this.calculateRootMargin( target, viewportHeight ),
			} );

			observer.observe( target );
			this.observers.push( observer );
		} );
	}

	disconnect() {
		this.observers.forEach( ( observer ) => observer.disconnect() );
		this.observers = [];
		this.active.clear();
	}

	// Core copy of elementor-pro/assets/dev/js/frontend/utils/anchor-link.js; keep the margin rule in sync with it.
	calculateRootMargin( target, viewportHeight ) {
		const halfViewport = viewportHeight / 2;
		const isTallerThanHalfViewport = ( target.offsetHeight || 0 ) > halfViewport;
		const blockStart = isTallerThanHalfViewport ? -halfViewport : 0;

		return `${ blockStart }px 0px ${ -halfViewport }px 0px`;
	}

	hasAllObserversReported() {
		return 0 === this.pendingReports;
	}

	toggle( item, isIntersecting ) {
		if ( isIntersecting ) {
			this.active.add( item );
		} else {
			this.active.delete( item );
		}

		if ( ! this.hasAllObserversReported() ) {
			return;
		}

		this.onChange( new Set( this.active ) );
	}

	onResize() {
		this.disconnect();
		this.observe();
	}
}
