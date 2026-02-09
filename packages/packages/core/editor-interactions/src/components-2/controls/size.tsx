import * as React from 'react';
import { SizeControl, type Unit, useBoundProp } from '@elementor/editor-controls';

export const Size = () => {
	const { propType } = useBoundProp();
	const units = propType.settings?.available_units ?? [];
	const defaultUnit = propType.settings?.default_unit;

	return <SizeControl disableCustom units={ units as never } defaultUnit={ defaultUnit as Unit } />;
};
