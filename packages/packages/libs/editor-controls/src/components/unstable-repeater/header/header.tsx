import * as React from 'react';
import { Box, Stack, Typography } from '@elementor/ui';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { ControlAdornments } from '../../../control-adornments/control-adornments';
import { SlotChildren } from '../../../control-replacements';
import { TooltipAddItemAction } from '../actions/tooltip-add-item-action';
import { RepeaterHeaderActionsSlot } from '../locations';

export const Header = React.forwardRef(
	(
		{
			label,
			children,
			adornment: Adornment = ControlAdornments,
		}: React.PropsWithChildren< {
			label: string;
			adornment?: React.FC;
		} >,
		ref
	) => {
		const { value } = useBoundProp();

		return (
			<Stack
				direction="row"
				alignItems="center"
				gap={ 1 }
				sx={ { marginInlineEnd: -0.75, py: 0.25 } }
				ref={ ref }
			>
				<Box display="flex" alignItems="center" gap={ 1 } sx={ { flexGrow: 1 } }>
					<Typography component="label" variant="caption" color="text.secondary" sx={ { lineHeight: 1 } }>
						{ label }
					</Typography>
					<Adornment />
				</Box>
				<RepeaterHeaderActionsSlot value={ value } />
				<SlotChildren whitelist={ [ TooltipAddItemAction ] as React.FC[] } sorted>
					{ children }
				</SlotChildren>
			</Stack>
		);
	}
);
