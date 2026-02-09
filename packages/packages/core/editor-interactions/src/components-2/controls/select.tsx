import * as React from 'react';
import { SelectControl, useBoundProp } from '@elementor/editor-controls';

import { type SelectOption } from '../../types';

export const Select = () => {
	const { propType } = useBoundProp();
	const options = propType.settings?.enum ?? [];

	return <SelectControl options={ options as SelectOption[] } />;
};
