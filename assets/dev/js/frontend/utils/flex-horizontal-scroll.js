export function changeScrollStatus( element, event ) {
	if ( 'mousedown' === event.type ) {
		element.classList.add( 'e-scroll' );
		element.dataset.pageX = event.pageX;
	} else {
		element.classList.remove( 'e-scroll', 'e-scroll-active' );
		element.dataset.pageX = '';
	}
}

// This function was written using this example https://codepen.io/thenutz/pen/VwYeYEE.
export function setHorizontalTitleScrollValues( element, horizontalScrollStatus, event ) {
	const isActiveScroll = element.classList.contains( 'e-scroll' ),
		isHorizontalScrollActive = 'enable' === horizontalScrollStatus,
		headingContentIsWiderThanWrapper = element.scrollWidth > element.clientWidth;

	if ( ! isActiveScroll || ! isHorizontalScrollActive || ! headingContentIsWiderThanWrapper ) {
		return;
	}

	event.preventDefault();

	const previousPositionX = parseFloat( element.dataset.pageX ),
		mouseMoveX = event.pageX - previousPositionX,
		maximumScrollValue = 5,
		stepLimit = 20;

	let toScrollDistanceX = 0;

	if ( stepLimit < mouseMoveX ) {
		toScrollDistanceX = maximumScrollValue;
	} else if ( stepLimit * -1 > mouseMoveX ) {
		toScrollDistanceX = -1 * maximumScrollValue;
	} else {
		toScrollDistanceX = mouseMoveX;
	}

	element.scrollLeft = element.scrollLeft - toScrollDistanceX;
	element.classList.add( 'e-scroll-active' );
}

export function setHorizontalScrollAlignment( { element, direction, justifyCSSVariable, horizontalScrollStatus } ) {
	if ( ! element ) {
		return;
	}

	if ( isHorizontalScroll( element, horizontalScrollStatus ) ) {
		initialScrollPosition( element, direction, justifyCSSVariable );
	} else {
		element.style.setProperty( justifyCSSVariable, '' );
	}
}

function isHorizontalScroll( element, horizontalScrollStatus ) {
	return element.clientWidth < getChildrenWidth( element.children ) && 'enable' === horizontalScrollStatus;
}

function getChildrenWidth( children ) {
	let totalWidth = 0;

	const parentContainer = children[ 0 ].parentNode,
		computedStyles = getComputedStyle( parentContainer ),
		gap = parseFloat( computedStyles.gap ) || 0; // Get the gap value or default to 0 if it's not specified

	for ( let i = 0; i < children.length; i++ ) {
		totalWidth += children[ i ].offsetWidth + gap;
	}

	return totalWidth;
}

function initialScrollPosition( element, direction, justifyCSSVariable ) {
	const isRTL = elementorFrontend.config.is_rtl;

	switch ( direction ) {
		case 'end':
			element.style.setProperty( justifyCSSVariable, 'start' );
			element.scrollLeft = isRTL ? -1 * getChildrenWidth( element.children ) : getChildrenWidth( element.children );
			break;
		default:
			element.style.setProperty( justifyCSSVariable, 'start' );
			element.scrollLeft = 0;
	}
}
