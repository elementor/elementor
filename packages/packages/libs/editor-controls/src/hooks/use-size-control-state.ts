import { useEffect, useMemo, useRef } from 'react';
import { type CreateOptions, type SizePropValue } from '@elementor/editor-props';

import { type SetValue, type SetValueMeta } from '../bound-prop-context';
import { DEFAULT_SIZE, type ExtendedOption, type Unit } from '../utils/size-control';
import { createStateFromSizeProp, extractValueFromState, type State } from '../utils/size-control-helpers';
import { useSyncExternalState } from './use-sync-external-state';

type SizeValue = SizePropValue[ 'value' ];

type SetterFunc = ( value: State ) => State;

export function useSizeControlState(
	sizeValue: SizeValue | null,
	actualDefaultUnit: Unit | ExtendedOption,
	setSizeValue: SetValue< SizeValue | null >
): {
	state: State;
	setState: ( setter: State | SetterFunc, options?: CreateOptions, meta?: SetValueMeta ) => void;
	controlSize: string | number;
	controlUnit: Unit | ExtendedOption;
} {
	const lastSelectedUnitRef = useRef< Unit | ExtendedOption >( actualDefaultUnit );

	const memorizedExternalState = useMemo( () => {
		const unitToUse = sizeValue?.unit ?? lastSelectedUnitRef.current;
		return createStateFromSizeProp( sizeValue, unitToUse );
	}, [ sizeValue ] );

	const [ state, setState ] = useSyncExternalState( {
		external: memorizedExternalState,
		setExternal: ( newState: State | null, options, meta ) =>
			setSizeValue( extractValueFromState( newState ), options, meta ),
		persistWhen: ( newState ) => {
			const extracted = extractValueFromState( newState );
			return !! extracted && extracted.size !== null && extracted.size !== undefined;
		},
		fallback: ( newState ) => ( {
			unit: newState?.unit ?? lastSelectedUnitRef.current,
			numeric: newState?.numeric ?? DEFAULT_SIZE,
			custom: newState?.custom ?? '',
		} ),
	} );

	useEffect( () => {
		if ( sizeValue?.unit ) {
			lastSelectedUnitRef.current = sizeValue.unit;
		}
	}, [ sizeValue?.unit ] );

	const { size: controlSize = DEFAULT_SIZE, unit: controlUnit = actualDefaultUnit } =
		extractValueFromState( state, true ) || {};

	return {
		state,
		setState,
		controlSize,
		controlUnit,
	};
}
