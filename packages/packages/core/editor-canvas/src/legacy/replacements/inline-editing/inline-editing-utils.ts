import { type V1Element } from '@elementor/editor-elements';

import { type LegacyWindow } from '../../types';

export const INLINE_EDITING_PROPERTY_PER_TYPE: Record< string, string > = {
	'e-form-label': 'text',
	'e-heading': 'title',
	'e-paragraph': 'paragraph',
};

export const legacyWindow = window as unknown as LegacyWindow;

export const getWidgetType = ( container: V1Element | null ) => {
	return container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' ) ?? null;
};
