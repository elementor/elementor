import { type V1Element } from '@elementor/editor-elements';

import { type LegacyWindow } from '../../types';

export const INLINE_EDITING_PROPERTY_PER_TYPE: Record< string, string > = {
	'e-heading': 'title',
	'e-paragraph': 'paragraph',
};

export const legacyWindow = window as unknown as LegacyWindow;

export const getWidgetType = ( container: V1Element | null ) => {
	return container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' ) ?? null;
};

export const getBlockedValue = ( value: string | null, tag: string | null ) => {
	if ( ! value ) {
		return '';
	}

	if ( ! tag ) {
		return value;
	}

	const pseudoElement = document.createElement( 'div' );

	pseudoElement.innerHTML = value;

	if ( ! pseudoElement?.children.length ) {
		return `<${ tag }>${ value }</${ tag }>`;
	}

	const firstChild = pseudoElement.children[ 0 ];
	const lastChild = Array.from( pseudoElement.children ).slice( -1 )[ 0 ];

	if ( firstChild === lastChild && pseudoElement.textContent === firstChild.textContent ) {
		return compareTag( firstChild, tag ) ? value : `<${ tag }>${ firstChild.innerHTML }</${ tag }>`;
	}

	if ( ! value.startsWith( `<${ tag }` ) || ! value.endsWith( `</${ tag }>` ) ) {
		return `<${ tag }>${ value }</${ tag }>`;
	}

	if ( firstChild !== lastChild || ! compareTag( firstChild, tag ) ) {
		return `<${ tag }>${ value }</${ tag }>`;
	}

	return value;
};

export const compareTag = ( el: Element, tag: string ) => {
	return el.tagName.toUpperCase() === tag.toUpperCase();
};

export const getInitialPopoverPosition = () => {
	const positionFallback = { left: 0, top: 0 };

	const iFrameElement = legacyWindow?.elementor?.$preview?.get( 0 );
	const iFramePosition = iFrameElement?.getBoundingClientRect() ?? positionFallback;

	const previewElement = legacyWindow?.elementor?.$previewWrapper?.get( 0 );
	const previewPosition = previewElement
		? { left: previewElement.scrollLeft, top: previewElement.scrollTop }
		: positionFallback;

	return {
		left: iFramePosition.left + previewPosition.left,
		top: iFramePosition.top + previewPosition.top,
	};
};
