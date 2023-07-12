export function changeScrollStatus( element, event ) {
	console.log( 'change' + element );

	if ( 'mousedown' === event.type ) {
		element.classList.add( 'e-scroll' );
		element.dataset.pageX = event.pageX;
	} else {
		element.classList.remove( 'e-scroll', 'e-scroll-active' );
		element.dataset.pageX = '';
	}
}

export function setAbsolutePositionToTabs( $wrapper, $tabTitles ) {
	const widget = $wrapper[ 0 ];

	$tabTitles.each( ( index, tabTitle ) => {
		tabTitle.style.removeProperty( '--n-tabs-title-position-block-start' );
		tabTitle.style.removeProperty( '--n-tabs-title-position-inline-start' );
		tabTitle.style.removeProperty( '--n-tabs-title-width' );
		tabTitle.style.removeProperty( '--n-tabs-title-height' );
	} );

	widget.style.removeProperty( '--n-tabs-title-position-inline-start-reference' );
	widget.classList.add( 'set-tab-scrolling' );

	const headingContentIsWiderThanWrapper = $wrapper[ 0 ].scrollWidth > $wrapper[ 0 ].clientWidth;

	if ( ! headingContentIsWiderThanWrapper ) {
		widget.style.removeProperty( '--n-tabs-title-position' );
		widget.classList.remove( 'set-tab-scrolling' );
		return;
	}

	const referenceInlineStart = $tabTitles[ 0 ].offsetLeft;
	widget.style.setProperty( '--n-tabs-title-position-inline-start-reference', referenceInlineStart );

	$tabTitles.each( ( index, tabTitle ) => {
		const tabTitleBox = tabTitle.getBoundingClientRect();

		tabTitle.style.setProperty( '--n-tabs-title-position-block-start', tabTitle.offsetTop + 'px' );
		tabTitle.style.setProperty( '--n-tabs-title-position-inline-start', ( tabTitle.offsetLeft - referenceInlineStart ) + 'px' );
		tabTitle.style.setProperty( '--n-tabs-title-width', tabTitleBox.width + 'px' );
		tabTitle.style.setProperty( '--n-tabs-title-height', tabTitleBox.height + 'px' );
	} );

	widget.style.setProperty( '--n-tabs-title-position', 'absolute' );
	widget.classList.remove( 'set-tab-scrolling' );
}

// This function was written using this example https://codepen.io/thenutz/pen/VwYeYEE.
export function setHorizontalTitleScrollValues( element, horizontalScrollStatus, event ) {
	console.log( 'hor ' + element );

	const isActiveScroll = element.classList.contains( 'e-scroll' ),
		isHorizontalScrollActive = 'enable' === horizontalScrollStatus,
		headingContentIsWiderThanWrapper = 'absolute' === element.style?.getPropertyValue( '--n-tabs-title-position' );

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

	const newInlineReferenceValue = parseFloat( element.style.getPropertyValue( '--n-tabs-title-position-inline-start-reference' ) ) + toScrollDistanceX;
	console.log( 'new' + newInlineReferenceValue );
	console.log( 'existing ' + element.style.getPropertyValue( '--n-tabs-title-position-inline-start-reference' ) );

	element.style.setProperty( '--n-tabs-title-position-inline-start-reference', newInlineReferenceValue );
	element.classList.add( 'e-scroll-active' );
}

// This function was written using this example https://codepen.io/thenutz/pen/VwYeYEE.
export function setHorizontalTitleScrollValuesBackup( element, horizontalScrollStatus, event ) {
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
	// Check element width.
	// Compare original

	return 'absolute' === element.style.getPropertyValue( '--n-tabs-title-position' ) && 'enable' === horizontalScrollStatus;
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
	const isRTL = elementorCommon.config.isRTL;

	switch ( direction ) {
		case 'end':
			element.style.setProperty( justifyCSSVariable, 'start' );
			// Element.scrollLeft = isRTL ? -1 * getChildrenWidth( element.children ) : getChildrenWidth( element.children );

			break;
		default:
			element.style.setProperty( justifyCSSVariable, 'start' );
			element.scrollLeft = 0;
	}
}
