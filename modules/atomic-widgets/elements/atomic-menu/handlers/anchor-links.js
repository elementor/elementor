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

		this.entries.forEach( ( { item, target } ) => {
			const observer = new IntersectionObserver( ( [ entry ] ) => {
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

	// An anchor counts as in view while it overlaps the top half of the viewport; an anchor taller than half the viewport must also reach past the middle.
	calculateRootMargin( target, viewportHeight ) {
		const halfViewport = viewportHeight / 2;
		const isTallerThanHalfViewport = ( target.offsetHeight || 0 ) > halfViewport;
		const blockStart = isTallerThanHalfViewport ? -halfViewport : 0;

		return `${ blockStart }px 0px ${ -halfViewport }px 0px`;
	}

	toggle( item, isIntersecting ) {
		if ( isIntersecting ) {
			this.active.add( item );
		} else {
			this.active.delete( item );
		}

		this.onChange( new Set( this.active ) );
	}

	onResize() {
		this.disconnect();
		this.observe();
	}
}
