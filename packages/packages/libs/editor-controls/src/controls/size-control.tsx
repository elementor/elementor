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
	type AngleUnit,
	angleUnits,
	DEFAULT_SIZE,
	DEFAULT_UNIT,
	type ExtendedOption,
	isUnitExtendedOption,
	type LengthUnit,
	lengthUnits,
	type TimeUnit,
	timeUnits,
	type Unit,
} from '../utils/size-control';

type SizeValue = SizePropValue[ 'value' ];

type SizeVariant = 'length' | 'angle' | 'time';

type UnitProps< T extends readonly Unit[] > = {
	units?: T;
	defaultUnit?: T[ number ];
};

type BaseSizeControlProps = {
	placeholder?: string;
	startIcon?: React.ReactNode;
	extendedOptions?: ExtendedOption[];
	disableCustom?: boolean;
	anchorRef?: RefObject< HTMLDivElement | null >;
};

type LengthSizeControlProps = BaseSizeControlProps &
	UnitProps< LengthUnit[] > & {
		variant: 'length';
	};

type AngleSizeControlProps = BaseSizeControlProps &
	UnitProps< AngleUnit[] > & {
		variant: 'angle';
	};

type TimeSizeControlProps = BaseSizeControlProps &
	UnitProps< TimeUnit[] > & {
		variant: 'time';
	};

export type SizeControlProps = LengthSizeControlProps | AngleSizeControlProps | TimeSizeControlProps;

type State = {
	numeric: number;
	custom: string;
	unit: Unit | ExtendedOption;
};

const defaultSelectedUnit: Record< SizeControlProps[ 'variant' ], Unit > = {
	length: 'px',
	angle: 'deg',
	time: 'ms',
} as const;

const defaultUnits: Record< SizeControlProps[ 'variant' ], Unit[] > = {
	length: [ ...lengthUnits ] as LengthUnit[],
	angle: [ ...angleUnits ] as AngleUnit[],
	time: [ ...timeUnits ] as TimeUnit[],
} as const;

export const SizeControl = createControl(
	( {
		variant = 'length' as SizeControlProps[ 'variant' ],
		defaultUnit,
		units,
		placeholder,
		startIcon,
		anchorRef,
		extendedOptions,
		disableCustom,
	}: Omit< SizeControlProps, 'variant' > & { variant?: SizeVariant } ) => {
		const actualDefaultUnit = defaultUnit ?? defaultSelectedUnit[ variant ];
		const actualUnits = units ?? [ ...defaultUnits[ variant ] ];
		const { value: sizeValue, setValue: setSizeValue, disabled, restoreValue } = useBoundProp( sizePropTypeUtil );
		const [ internalState, setInternalState ] = useState( createStateFromSizeProp( sizeValue, actualDefaultUnit ) );
		const activeBreakpoint = useActiveBreakpoint();

		const actualExtendedOptions = useSizeExtendedOptions( extendedOptions || [], disableCustom ?? false );
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
				unit: newState?.unit ?? actualDefaultUnit,
				numeric: newState?.numeric ?? DEFAULT_SIZE,
				custom: newState?.custom ?? '',
			} ),
		} );

		const { size: controlSize = DEFAULT_SIZE, unit: controlUnit = actualDefaultUnit } =
			extractValueFromState( state ) || {};

		const handleUnitChange = ( newUnit: Unit | ExtendedOption ) => {
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
			const newState = createStateFromSizeProp(
				sizeValue,
				state.unit === 'custom' ? state.unit : actualDefaultUnit
			);
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
			const newState = createStateFromSizeProp( sizeValue, actualDefaultUnit );

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
					units={ [ ...actualUnits, ...( actualExtendedOptions || [] ) ] }
					placeholder={ placeholder }
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
	}
);

function formatSize< TSize extends string | number >( size: TSize, unit: Unit | ExtendedOption ): TSize {
	if ( isUnitExtendedOption( unit ) ) {
		return unit === 'auto' ? ( '' as TSize ) : ( String( size ?? '' ) as TSize );
	}

	return size || size === 0 ? ( Number( size ) as TSize ) : ( NaN as TSize );
}

function createStateFromSizeProp( sizeValue: SizeValue | null, defaultUnit: Unit | ExtendedOption ): State {
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
