export default class extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				links: '.elementor-element a[href*="#"]',
				stickyElements: '.elementor-element.elementor-sticky',
			},
		};
	}

	onInit() {
		this.bindLayoutShiftCorrection();

		this.observeStickyElements( () => {
			this.initializeStickyAndAnchorTracking();
		} );
	}

	// Same-page anchor links scroll natively (CSS `scroll-behavior: smooth`), and the browser fixes the
	// destination when the scroll starts. If content above the target grows meanwhile (lazy images,
	// entrance animations, late widgets), the scroll ends short of the anchor (ED-19404). Re-measure the
	// target when that scroll ends and, if it moved, smoothly scroll to it once more. `scrollIntoView`
	// keeps honoring the `scroll-margin-top` this class sets for sticky offsets.
	bindLayoutShiftCorrection() {
		document.addEventListener( 'click', ( event ) => {
			const link = event.target.closest( this.getSettings( 'selectors.links' ) );

			if ( ! link?.hash || link.hostname !== location.hostname || link.pathname !== location.pathname ) {
				return;
			}

			const target = this.getAnchorTarget( link );

			// Already in place: the browser won't scroll, so no `scrollend` would come to clear the listener.
			if ( ! target || Math.abs( target.getBoundingClientRect().top - ( parseFloat( target.style.scrollMarginTop ) || 0 ) ) < 2 ) {
				return;
			}

			const startPosition = this.getScrollPosition( target );
			const realignIfShifted = () => {
				if ( Math.abs( this.getScrollPosition( target ) - startPosition ) > 2 ) {
					target.scrollIntoView( { behavior: 'smooth', block: 'start' } );
				}
			};

			// Browsers without `scrollend` get a single check after a typical smooth-scroll duration.
			if ( 'onscrollend' in window ) {
				window.addEventListener( 'scrollend', realignIfShifted, { once: true } );
			} else {
				setTimeout( realignIfShifted, 800 );
			}
		} );
	}

	observeStickyElements( callback ) {
		const observer = new MutationObserver( ( mutationsList ) => {
			for ( const mutation of mutationsList ) {
				if ( 'childList' === mutation.type || ( 'attributes' === mutation.type && mutation.target.classList.contains( 'elementor-sticky' ) ) ) {
					callback();
				}
			}
		} );

		observer.observe( document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [ 'class', 'style' ],
		} );
	}

	initializeStickyAndAnchorTracking() {
		const anchorLinks = this.getAllAnchorLinks();
		const stickyElements = this.getAllStickyElements();
		const trackedElements = [];

		if ( ! stickyElements.length > 0 && ! anchorLinks.length > 0 ) {
			return;
		}

		this.trackStickyElements( stickyElements, trackedElements );
		this.trackAnchorLinks( anchorLinks, trackedElements );

		this.organizeStickyAndAnchors( trackedElements );
	}

	trackAnchorLinks( anchorLinks, trackedElements ) {
		anchorLinks.forEach( ( element ) => {
			const target = this.getAnchorTarget( element );
			const scrollPosition = this.getScrollPosition( target );
			trackedElements.push( {
				element: target,
				type: 'anchor',
				scrollPosition,
			} );
		} );
	}

	trackStickyElements( stickyElements, trackedElements ) {
		stickyElements.forEach( ( element ) => {
			const settings = this.getElementSettings( element );

			if ( ! settings || ! settings.sticky_anchor_link_offset ) {
				return;
			}

			const { sticky_anchor_link_offset: scrollMarginTop } = settings;

			if ( 0 === scrollMarginTop ) {
				return;
			}
			const scrollPosition = this.getScrollPosition( element );
			trackedElements.push( {
				scrollMarginTop,
				type: 'sticky',
				scrollPosition,
			} );
		} );
	}

	organizeStickyAndAnchors( elements ) {
		const stickyList = this.filterAndSortElementsByType( elements, 'sticky' );
		const anchorList = this.filterAndSortElementsByType( elements, 'anchor' );

		stickyList.forEach( ( sticky, index ) => {
			this.defineCurrentStickyRange( sticky, index, stickyList, anchorList );
		} );
	}

	defineCurrentStickyRange( sticky, index, stickyList, anchorList ) {
		const nextStickyScrollPosition = ( index + 1 < stickyList.length )
			? stickyList[ index + 1 ].scrollPosition
			: Infinity;

		sticky.anchor = anchorList.filter( ( anchor ) => {
			const withinRange = anchor.scrollPosition > sticky.scrollPosition && anchor.scrollPosition < nextStickyScrollPosition;
			if ( withinRange ) {
				anchor.element.style.scrollMarginTop = `${ sticky.scrollMarginTop }px`;
			}
			return withinRange;
		} );
	}

	getScrollPosition( element ) {
		let offsetTop = 0;

		while ( element ) {
			offsetTop += element.offsetTop;
			element = element.offsetParent;
		}

		return offsetTop;
	}

	getAllStickyElements() {
		const allStickyElements = document.querySelectorAll( this.getSettings( 'selectors.stickyElements' ) );

		return Array.from( allStickyElements ).filter( ( anchor, index, self ) =>
			index === self.findIndex( ( t ) => t.getAttribute( 'data-id' ) === anchor.getAttribute( 'data-id' ) ),
		);
	}

	getAllAnchorLinks() {
		const allAnchors = document.querySelectorAll( this.getSettings( 'selectors.links' ) );

		return Array.from( allAnchors ).filter( ( anchor, index, self ) =>
			index === self.findIndex( ( t ) => t.getAttribute( 'href' ) === anchor.getAttribute( 'href' ) ),
		);
	}

	filterAndSortElementsByType( elements, type ) {
		return elements
			.filter( ( item ) => type === item.type )
			.sort( ( a, b ) => a.scrollPosition - b.scrollPosition );
	}

	isValidSelector( hash ) {
		const validSelectorPattern = /^#[A-Za-z_][\w-]*$/;
		return validSelectorPattern.test( hash );
	}

	getAnchorTarget( element ) {
		const hash = element?.hash;

		if ( ! this.isValidSelector( hash ) ) {
			return null;
		}
		return document.querySelector( hash );
	}

	getElementSettings( element ) {
		return JSON.parse( element.getAttribute( 'data-settings' ) );
	}
}
