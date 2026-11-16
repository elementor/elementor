import * as React from 'react';
import { type ElementID } from '@elementor/editor-elements';
import { type PropKey } from '@elementor/editor-props';
import { createLocation } from '@elementor/locations';

import { useBoundProp } from '../bound-prop-context';
import { type AppPromotion } from '../controls/app-promotion-trigger';

export type ControlHeaderProps = {
	elementId?: ElementID;
	controlType: string;
	bind: PropKey;
	path: PropKey[];
	promotion?: AppPromotion;
};

export const {
	Slot: ControlHeaderSlot,
	inject: injectIntoControlHeader,
	useInjections: useControlHeaderInjections,
} = createLocation< ControlHeaderProps >();

type ControlHeaderActionsProps = {
	elementId?: ElementID;
	controlType: string;
	promotion?: AppPromotion;
};

export const ControlHeaderActions = ( { elementId, controlType, promotion }: ControlHeaderActionsProps ) => {
	const { bind, path } = useBoundProp();

	return (
		<ControlHeaderSlot
			elementId={ elementId }
			controlType={ controlType }
			bind={ bind }
			path={ path }
			promotion={ promotion }
		/>
	);
};
