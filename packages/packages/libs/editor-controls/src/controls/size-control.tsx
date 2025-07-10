import * as React from 'react';
import { type RefObject, useEffect, useState } from 'react';
import { sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { usePopupState } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { SizeInput } from '../components/size-control/size-input';
import { TextFieldPopover } from '../components/text-field-popover';
import { createControl } from '../create-control';
import { useSizeExtendedOptions } from '../hooks/use-size-extended-options';
import { useSyncExternalState } from '../hooks/use-sync-external-state';
import {
	defaultUnits,
	type DegreeUnit,
	type ExtendedOption,
	isUnitExtendedOption,
	type Unit,
} from '../utils/size-control';

const DEFAULT_UNIT = 'px';
const DEFAULT_SIZE = NaN;

type SizeValue = SizePropValue[ 'value' ];

type SizeControlProps = {
	placeholder?: string;
	startIcon?: React.ReactNode;
	units?: ( Unit | DegreeUnit )[];
	extendedOptions?: ExtendedOption[];
	disableCustom?: boolean;
	anchorRef?: RefObject< HTMLDivElement | null >;
	defaultUnit?: Unit | DegreeUnit;
};

type State = {
	numeric: number;
	custom: string;
	unit: Unit | DegreeUnit | ExtendedOption;
};

export const SizeControl = createControl( ( props: SizeControlProps ) => {
	const defaultUnit = props.defaultUnit ?? DEFAULT_UNIT;
	const { units = [ ...defaultUnits ], placeholder, startIcon, anchorRef } = props;
	const {
		value: sizeValue,
		placeholder: sizePlaceholder,
		setValue: setSizeValue,
		disabled,
		restoreValue,
	} = useBoundProp( sizePropTypeUtil );
	const [ internalState, setInternalState ] = useState( createStateFromSizeProp( sizeValue, defaultUnit ) );
	const activeBreakpoint = useActiveBreakpoint();

	const extendedOptions = useSizeExtendedOptions( props.extendedOptions || [], props.disableCustom ?? false );
	const popupState = usePopupState( { variant: 'popover' } );

	const [ state, setState ] = useSyncExternalState( {
		external: internalState,
		setExternal: ( newState: State | null ) => setSizeValue( extractValueFromState( newState ) ),
		persistWhen: ( newState ) => {
			if ( ! newState?.unit ) {
				return false;
			}

			if ( isUnitExtendedOption( newState.unit ) ) {
				return newState.unit === 'auto' ? true : !! newState.custom;
			}

			return !! newState?.numeric || newState?.numeric === 0;
		},
		fallback: ( newState ) => ( {
			unit: newState?.unit ?? defaultUnit,
			numeric: newState?.numeric ?? DEFAULT_SIZE,
			custom: newState?.custom ?? '',
		} ),
	} );

	const { size: controlSize = DEFAULT_SIZE, unit: controlUnit = defaultUnit } = extractValueFromState( state ) || {};

	const handleUnitChange = ( newUnit: Unit | DegreeUnit | ExtendedOption ) => {
		if ( newUnit === 'custom' ) {
			popupState.open( anchorRef?.current );
		}

		setState( ( prev ) => ( { ...prev, unit: newUnit } ) );
	};

	const handleSizeChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const { value: size } = event.target;

		if ( controlUnit === 'auto' ) {
			setState( ( prev ) => ( { ...prev, unit: controlUnit } ) );

			return;
		}

		setState( ( prev ) => ( {
			...prev,
			[ controlUnit === 'custom' ? 'custom' : 'numeric' ]: formatSize( size, controlUnit ),
			unit: controlUnit,
		} ) );
	};

	const onInputFocus = ( event: React.FocusEvent< HTMLInputElement > ) => {
		if ( isUnitExtendedOption( state.unit ) ) {
			( event.target as HTMLElement )?.blur();
		}
	};

	const onInputClick = ( event: React.MouseEvent ) => {
		if ( ( event.target as HTMLElement ).closest( 'input' ) && 'custom' === state.unit ) {
			popupState.open( anchorRef?.current );
		}
	};

	useEffect( () => {
		const newState = createStateFromSizeProp( sizeValue, state.unit === 'custom' ? state.unit : defaultUnit );
		const currentUnitType = isUnitExtendedOption( state.unit ) ? 'custom' : 'numeric';
		const mergedStates = {
			...state,
			unit: newState.unit ?? state.unit,
			[ currentUnitType ]: newState[ currentUnitType ],
		};

		if ( mergedStates.unit !== 'auto' && areStatesEqual( state, mergedStates ) ) {
			return;
		}

		if ( state.unit === newState.unit ) {
			setInternalState( mergedStates );

			return;
		}

		setState( newState );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ sizeValue ] );

	useEffect( () => {
		const newState = createStateFromSizeProp( sizeValue, defaultUnit );

		if ( activeBreakpoint && ! areStatesEqual( newState, state ) ) {
			setState( newState );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ activeBreakpoint ] );

	return (
		<>
			<SizeInput
				disabled={ disabled }
				size={ controlSize }
				unit={ controlUnit }
				units={ [ ...units, ...( extendedOptions || [] ) ] }
				placeholder={ placeholder ?? sizePlaceholder }
				startIcon={ startIcon }
				handleSizeChange={ handleSizeChange }
				handleUnitChange={ handleUnitChange }
				onBlur={ restoreValue }
				onFocus={ onInputFocus }
				onClick={ onInputClick }
				popupState={ popupState }
			/>
			{ anchorRef?.current && (
				<TextFieldPopover
					popupState={ popupState }
					anchorRef={ anchorRef }
					restoreValue={ restoreValue }
					value={ controlSize as string }
					onChange={ handleSizeChange }
				/>
			) }
		</>
	);
} );

function formatSize< TSize extends string | number >( size: TSize, unit: Unit | DegreeUnit | ExtendedOption ): TSize {
	if ( isUnitExtendedOption( unit ) ) {
		return unit === 'auto' ? ( '' as TSize ) : ( String( size ?? '' ) as TSize );
	}

	return size || size === 0 ? ( Number( size ) as TSize ) : ( NaN as TSize );
}

function createStateFromSizeProp(
	sizeValue: SizeValue | null,
	defaultUnit: Unit | DegreeUnit | ExtendedOption
): State {
	const unit = sizeValue?.unit ?? defaultUnit;
	const size = sizeValue?.size ?? '';

	return {
		numeric:
			! isUnitExtendedOption( unit ) && ! isNaN( Number( size ) ) && ( size || size === 0 )
				? Number( size )
				: DEFAULT_SIZE,
		custom: unit === 'custom' ? String( size ) : '',
		unit,
	};
}

function extractValueFromState( state: State | null ): SizeValue | null {
	if ( ! state ) {
		return null;
	}

	if ( ! state?.unit ) {
		return { size: DEFAULT_SIZE, unit: DEFAULT_UNIT };
	}

	const { unit } = state;

	if ( unit === 'auto' ) {
		return { size: '', unit };
	}

	return {
		size: state[ unit === 'custom' ? 'custom' : 'numeric' ],
		unit,
	} as SizeValue;
}

function areStatesEqual( state1: State, state2: State ): boolean {
	if ( state1.unit !== state2.unit || state1.custom !== state2.custom ) {
		return false;
	}

	if ( isUnitExtendedOption( state1.unit ) ) {
		return state1.custom === state2.custom;
	}

	return state1.numeric === state2.numeric || ( isNaN( state1.numeric ) && isNaN( state2.numeric ) );
}
