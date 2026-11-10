import * as React from 'react';
import { type ElementID } from '@elementor/editor-elements';
import { type PropKey } from '@elementor/editor-props';
import { createLocation } from '@elementor/locations';

import { useBoundProp } from '../bound-prop-context';

export type ControlHeaderProps = {
	elementId?: ElementID;
	controlType: string;
	bind: PropKey;
	path: PropKey[];
};

export const {
	Slot: ControlHeaderSlot,
	inject: injectIntoControlHeader,
	useInjections: useControlHeaderInjections,
} = createLocation< ControlHeaderProps >();

type ControlHeaderActionsProps = {
	elementId?: ElementID;
	controlType: string;
};

export const ControlHeaderActions = ( { elementId, controlType }: ControlHeaderActionsProps ) => {
	const { bind, path } = useBoundProp();

	return <ControlHeaderSlot elementId={ elementId } controlType={ controlType } bind={ bind } path={ path } />;
};
