// Moved from elementor pro: 'assets/dev/js/frontend/utils'
export default class Scroll {
	/**
	 * @param {Object}      obj
	 * @param {number}      obj.sensitivity - Value between 0-100 - Will determine the intersection trigger points on the element
	 * @param {Function}    obj.callback    - Will be triggered on each intersection point between the element and the viewport top/bottom
	 * @param {string}      obj.offset      - Offset between the element intersection points and the viewport, written like in CSS: '-50% 0 -25%'
	 * @param {HTMLElement} obj.root        - The element that the events will be relative to, if 'null' will be relative to the viewport
	 */
	static scrollObserver( obj ) {
		let lastScrollY = 0;

		// Generating thresholds points along the animation height
		// More thresholds points = more trigger points of the callback
		const buildThresholds = ( sensitivityPercentage = 0 ) => {
			const thresholds = [];

			if ( sensitivityPercentage > 0 && sensitivityPercentage <= 100 ) {
				const increment = 100 / sensitivityPercentage;

				for ( let i = 0; i <= 100; i += increment ) {
					thresholds.push( i / 100 );
				}
			} else {
				thresholds.push( 0 );
			}

			return thresholds;
		};

		const options = {
			root: obj.root || null,
			rootMargin: obj.offset || '0px',
			threshold: buildThresholds( obj.sensitivity ),
		};

		function handleIntersect( entries ) {
			const currentScrollY = entries[ 0 ].boundingClientRect.y,
				isInViewport = entries[ 0 ].isIntersecting,
				intersectionScrollDirection = ( currentScrollY < lastScrollY ) ? 'down' : 'up',
				scrollPercentage = Math.abs( parseFloat( ( entries[ 0 ].intersectionRatio * 100 ).toFixed( 2 ) ) );

			obj.callback( {
				sensitivity: obj.sensitivity,
				isInViewport,
				scrollPercentage,
				intersectionScrollDirection,
			} );

			lastScrollY = currentScrollY;
		}

		return new IntersectionObserver( handleIntersect, options );
	}

	/**
	 * @param {jQuery.Element} $element
	 * @param {Object}         offsetObj
	 * @param {number}         offsetObj.start - Offset start value in percentages
	 * @param {number}         offsetObj.end   - Offset end value in percentages
	 */
	static getElementViewportPercentage( $element, offsetObj = {} ) {
		const elementOffset = $element[ 0 ].getBoundingClientRect(),
			offsetStart = offsetObj.start || 0,
			offsetEnd = offsetObj.end || 0,
			windowStartOffset = window.innerHeight * offsetStart / 100,
			windowEndOffset = window.innerHeight * offsetEnd / 100,
			y1 = elementOffset.top - window.innerHeight,
			y2 = ( elementOffset.top + windowStartOffset ) + $element.height(),
			startPosition = ( 0 - y1 ) + windowStartOffset,
			endPosition = ( y2 - y1 ) + windowEndOffset,
			percent = Math.max( 0, Math.min( startPosition / endPosition, 1 ) );

		return parseFloat( ( percent * 100 ).toFixed( 2 ) );
	}

	/**
	 * @param {Object} offsetObj
	 * @param {number} offsetObj.start - Offset start value in percentages
	 * @param {number} offsetObj.end   - Offset end value in percentages
	 * @param {number} limitPageHeight - Will limit the page height calculation
	 */
	static getPageScrollPercentage( offsetObj = {}, limitPageHeight ) {
		const offsetStart = offsetObj.start || 0,
			offsetEnd = offsetObj.end || 0,
			initialPageHeight = limitPageHeight || ( document.documentElement.scrollHeight - document.documentElement.clientHeight ),
			heightOffset = initialPageHeight * offsetStart / 100,
			pageRange = initialPageHeight + heightOffset + ( initialPageHeight * offsetEnd / 100 ),
			scrollPos = ( document.documentElement.scrollTop + document.body.scrollTop ) + heightOffset;

		return ( scrollPos / pageRange * 100 );
	}
}
