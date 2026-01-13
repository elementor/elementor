import { type ComponentType } from 'react';

import { type DirectionFieldProps, type FieldProps, type ReplayFieldProps } from './types';

type InteractionsControlType = 'trigger' | 'effect' | 'effectType' | 'direction' | 'duration' | 'delay' | 'replay';

type InteractionsControlPropsMap = {
	trigger: FieldProps;
	effect: FieldProps;
	effectType: FieldProps;
	direction: DirectionFieldProps;
	duration: FieldProps;
	delay: FieldProps;
	replay: ReplayFieldProps;
};

type ControlOptions< T extends InteractionsControlType > = {
	type: T;
	component: ComponentType< InteractionsControlPropsMap[ T ] >;
	options?: string[];
};

type StoredControlOptions = {
	type: InteractionsControlType;
	component: ComponentType< FieldProps | DirectionFieldProps | ReplayFieldProps >;
	options?: string[];
};

const controlsRegistry = new Map< InteractionsControlType, StoredControlOptions >();

export function registerInteractionsControl< T extends InteractionsControlType >( {
	type,
	component,
	options,
}: ControlOptions< T > ) {
	controlsRegistry.set( type, { type, component: component as StoredControlOptions[ 'component' ], options } );
}

export function getInteractionsControl( type: InteractionsControlType ) {
	return controlsRegistry.get( type );
}

export function getInteractionsControlOptions( type: InteractionsControlType ) {
	return controlsRegistry.get( type )?.options ?? [];
}
