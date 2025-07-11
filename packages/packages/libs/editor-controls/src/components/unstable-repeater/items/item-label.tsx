import * as React from 'react';
import { Box } from '@elementor/ui';

import { RepeaterItemLabelSlot } from '../../../locations';

export const ItemLabel = () => {
	const value = 'Item Label';

	return (
		<RepeaterItemLabelSlot value={ value }>
			<Box component="span">{ value }</Box>
		</RepeaterItemLabelSlot>
	);
};
