import { type ComponentType } from 'react';

import { type CustomEffect, type DirectionFieldProps, type FieldProps, type ReplayFieldProps } from './types';

type InteractionsControlType =
	| 'trigger'
	| 'effect'
	| 'custom'
	| 'effectType'
	| 'direction'
	| 'duration'
	| 'delay'
	| 'replay'
	| 'easing'
	| 'relativeTo'
	| 'offsetTop'
	| 'offsetBottom';

type InteractionsControlPropsMap = {
	trigger: FieldProps;
	effect: FieldProps;
	custom?: FieldProps< CustomEffect >;
	effectType: FieldProps;
	direction: DirectionFieldProps;
	duration: FieldProps;
	delay: FieldProps;
	replay: ReplayFieldProps;
	easing: FieldProps;
	relativeTo: FieldProps;
	offsetTop: FieldProps;
	offsetBottom: FieldProps;
};

type AnyInteractionsControlProps = Exclude<
	InteractionsControlPropsMap[ InteractionsControlType ],
	undefined
>;

type ControlOptions< T extends InteractionsControlType > = {
	type: T;
	component: ComponentType< InteractionsControlPropsMap[ T ] >;
	options?: string[];
};

type StoredControlOptions = {
	type: InteractionsControlType;
	component: ComponentType< AnyInteractionsControlProps >;
	options?: string[];
};

const controlsRegistry = new Map< InteractionsControlType, StoredControlOptions >();

export function registerInteractionsControl< T extends InteractionsControlType >( {
	type,
	component,
	options,
}: ControlOptions< T > ) {
	controlsRegistry.set( type, {
		type,
		component: component as ComponentType< AnyInteractionsControlProps >,
		options,
	} );
}

export function getInteractionsControl( type: InteractionsControlType ) {
	return controlsRegistry.get( type );
}

export function getInteractionsControlOptions( type: InteractionsControlType ) {
	return controlsRegistry.get( type )?.options ?? [];
}
