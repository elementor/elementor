import * as React from 'react';
import { Box, Stack, Typography } from '@elementor/ui';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { ControlAdornments } from '../../../control-adornments/control-adornments';
import { SlotChildren } from '../../../control-replacements';
import { TransformBaseControl } from '../../../controls/transform-control/transform-base-control';
import { TooltipAddItemAction } from '../actions/tooltip-add-item-action';
import { RepeaterHeaderActionsSlot } from '../locations';

export const Header = React.forwardRef( ( { label, children }: React.PropsWithChildren< { label: string } >, ref ) => {
	const { value } = useBoundProp();

	return (
		<Stack
			direction="row"
			justifyContent="start"
			alignItems="center"
			gap={ 1 }
			sx={ { marginInlineEnd: -0.75, py: 0.25 } }
			ref={ ref }
		>
			<Typography component="label" variant="caption" color="text.secondary" sx={ { lineHeight: 1 } }>
				{ label }
			</Typography>
			<ControlAdornments />
			<Spacer />
			<RepeaterHeaderActionsSlot value={ value } />
			<SlotChildren whitelist={ [ TransformBaseControl, TooltipAddItemAction ] as React.FC[] } sorted>
				{ children }
			</SlotChildren>
		</Stack>
	);
} );

const Spacer = () => <Box component="span" sx={ { ml: 'auto', display: 'block' } }></Box>;
