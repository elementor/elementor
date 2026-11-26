import {
	type ElementID,
	getContainer,
	getDefaultStyleTagFromPreviewElement,
	getElementSetting,
} from '@elementor/editor-elements';
import { classesPropTypeUtil, type ClassesPropValue } from '@elementor/editor-props';
import { getBreakpointsTree } from '@elementor/editor-responsive';

import { getElementClassesProp } from '../utils/element-local-style';
import { createStylesInheritance } from './create-styles-inheritance';
import { getAppliedStyles } from './get-applied-styles';
import { type StylesInheritanceAPI } from './types';

export function getElementStylesInheritance( elementId: ElementID ): StylesInheritanceAPI | null {
	const container = getContainer( elementId );
	const classesProp = getElementClassesProp( elementId );

	if ( ! container || ! classesProp ) {
		return null;
	}

	const appliedStyles = getAppliedStyles( {
		elementTypeKey: container.model.get( 'widgetType' ) || container.model.get( 'elType' ),
		appliedStyleIds:
			classesPropTypeUtil.extract( getElementSetting< ClassesPropValue >( elementId, classesProp ) ) ?? [],
		defaultTagStyleId: getDefaultStyleTagFromPreviewElement( elementId ),
		activeStyleId: null,
	} );

	return createStylesInheritance( appliedStyles, getBreakpointsTree() );
}
