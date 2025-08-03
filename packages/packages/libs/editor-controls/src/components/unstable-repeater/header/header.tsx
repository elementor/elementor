import * as React from 'react';
import { Stack, Typography } from '@elementor/ui';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { ControlAdornments } from '../../../control-adornments/control-adornments';
import { SlotChildren } from '../../../control-replacements';
import { RepeaterHeaderActionsSlot } from '../../../locations';
import { TooltipAddItemAction } from '../actions/tooltip-add-item-action';

export const Header = ( { label, children }: React.PropsWithChildren< { label: string } > ) => {
	const { value } = useBoundProp();

	return (
		<Stack direction="row" justifyContent="start" alignItems="center" gap={ 1 } sx={ { marginInlineEnd: -0.75 } }>
			<Typography component="label" variant="caption" color="text.secondary">
				{ label }
			</Typography>
			<RepeaterHeaderActionsSlot value={ value } />
			<SlotChildren whitelist={ [ TooltipAddItemAction ] as React.FC[] }>{ children }</SlotChildren>
			<ControlAdornments />
		</Stack>
	);
};
