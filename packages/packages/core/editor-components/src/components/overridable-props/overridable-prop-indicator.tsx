import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { __getState as getState } from '@elementor/store';

import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { selectOverridableProps } from '../../store/store';
import { COMPONENT_DOCUMENT_TYPE } from '../consts';
import { Indicator } from './indicator';

const FORBIDDEN_KEYS = [ '_cssid', 'attributes' ];

export function OverridablePropIndicator() {
	const { bind, value } = useBoundProp();
	const currentDocument = getV1CurrentDocument();
	const componentOverrides = selectOverridableProps( getState(), currentDocument.id );

	if ( currentDocument.config.type !== COMPONENT_DOCUMENT_TYPE || ! currentDocument.id ) {
		return null;
	}

	if ( ! isPropAllowed( bind ) ) {
		return null;
	}

	const isOverridable = componentOverridablePropTypeUtil.isValid( value );
	return (
		<Indicator
			componentId={ currentDocument.id }
			isOverridable={ isOverridable }
			overridables={ componentOverrides }
		/>
	);
}

function isPropAllowed( bind: string ) {
	return ! FORBIDDEN_KEYS.includes( bind );
}
