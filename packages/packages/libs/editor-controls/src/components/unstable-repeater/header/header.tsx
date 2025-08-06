import * as React from 'react';
import { Stack, Typography } from '@elementor/ui';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { ControlAdornments } from '../../../control-adornments/control-adornments';
import { SlotChildren } from '../../../control-replacements';
import { TransformBaseControl } from '../../../controls/transform-control/transform-base-control';
import { TooltipAddItemAction } from '../actions/tooltip-add-item-action';
import { RepeaterHeaderActionsSlot } from '../locations';

export const Header = ( { label, children }: React.PropsWithChildren< { label: string } > ) => {
	const { value } = useBoundProp();

	return (
		<Stack direction="row" justifyContent="start" alignItems="center" gap={ 1 } sx={ { marginInlineEnd: -0.75 } }>
			<Typography component="label" variant="caption" color="text.secondary">
				{ label }
			</Typography>
			<Spacer />
			<RepeaterHeaderActionsSlot value={ value } />
			<SlotChildren whitelist={ [ TransformBaseControl, TooltipAddItemAction ] as React.FC[] } sorted>
				{ children }
			</SlotChildren>
			<ControlAdornments />
		</Stack>
	);
};

const Spacer = () => <span style={ { marginInlineStart: 'auto' } }></span>;
