export default class AnchorLinks {
	constructor( entries, onChange ) {
		this.entries = entries;
		this.onChange = onChange;
		this.observers = [];
		this.active = new Set();
		this.reported = new Set();
		this.onResize = this.onResize.bind( this );
		this.onScroll = this.onScroll.bind( this );
	}

	initialize() {
		this.observe();
		window.addEventListener( 'resize', this.onResize );
		window.addEventListener( 'scroll', this.onScroll, { passive: true } );
	}

	destroy() {
		window.removeEventListener( 'resize', this.onResize );
		window.removeEventListener( 'scroll', this.onScroll );
		this.disconnect();
	}

	observe() {
		const viewportHeight = window.innerHeight;

		this.entries.forEach( ( { item, target } ) => {
			const observer = new IntersectionObserver( ( entries ) => {
				const entry = entries[ entries.length - 1 ];

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
		const isTallerThanHalfViewport = target.offsetHeight > halfViewport;
		const blockStart = isTallerThanHalfViewport ? -halfViewport : 0;

		return `${ blockStart }px 0px ${ -halfViewport }px 0px`;
	}

	toggle( item, isIntersecting ) {
		if ( isIntersecting ) {
			this.active.add( item );
		} else {
			this.active.delete( item );
		}

		this.report( this.getActiveItems() );
	}

	report( items ) {
		this.reported = items;
		this.onChange( new Set( items ) );
	}

	getActiveItems() {
		const lastEntry = this.getLastEntry();

		if ( lastEntry && this.isScrolledToBottom() && this.isInViewport( lastEntry.target ) ) {
			return new Set( [ lastEntry.item ] );
		}

		return new Set( this.active );
	}

	getLastEntry() {
		return this.entries.reduce( ( last, entry ) => {
			const isBelowLast = entry.target.getBoundingClientRect().top > last.target.getBoundingClientRect().top;

			return isBelowLast ? entry : last;
		} );
	}

	isScrolledToBottom() {
		return Math.ceil( window.scrollY + window.innerHeight ) >= document.documentElement.scrollHeight;
	}

	isInViewport( target ) {
		const { top, bottom } = target.getBoundingClientRect();

		return bottom > 0 && top < window.innerHeight;
	}

	onScroll() {
		const next = this.getActiveItems();
		const hasChanged = next.size !== this.reported.size || [ ...next ].some( ( item ) => ! this.reported.has( item ) );

		if ( hasChanged ) {
			this.report( next );
		}
	}

	onResize() {
		this.disconnect();
		this.observe();
	}
}
