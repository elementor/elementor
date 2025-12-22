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
