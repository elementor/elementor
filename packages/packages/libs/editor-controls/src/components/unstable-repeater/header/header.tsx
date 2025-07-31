import * as React from 'react';
import { Stack, Typography } from '@elementor/ui';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { ControlAdornments } from '../../../control-adornments/control-adornments';
import { SlotChildren } from '../../../control-replacements';
import { TooltipedAddItemAction } from '../actions/tooltiped-add-item-action';
import { useRepeaterContext } from '../context/repeater-context';
import { type RepeatablePropValue } from '../types';
import { HeaderItemsSlot } from './header-items-slot';

export const Header = ( { label, children }: React.PropsWithChildren< { label: string } > ) => {
	const {
		config: {
			headerItems: { Slot: ActionsSlot },
		},
	} = useRepeaterContext();
	const { value } = useBoundProp< RepeatablePropValue >();

	return (
		<Stack direction="row" justifyContent="start" alignItems="center" gap={ 1 } sx={ { marginInlineEnd: -0.75 } }>
			<Typography component="label" variant="caption" color="text.secondary">
				{ label }
			</Typography>
			<SlotChildren whitelist={ [ HeaderItemsSlot, TooltipedAddItemAction ] as React.FC[] }>{ children }</SlotChildren>
			<ActionsSlot value={ value } />
			<ControlAdornments />
		</Stack>
	);
};
