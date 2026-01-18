import { type RefObject, useCallback } from 'react';
import { type CreateOptions } from '@elementor/editor-props';
import { type PopupState } from '@elementor/ui';

import { type SetValueMeta } from '../bound-prop-context';
import { type ExtendedOption, type Unit } from '../utils/size-control';
import { formatSize, type State } from '../utils/size-control-helpers';

type SetterFunc = ( value: State ) => State;

export function useSizeControlHandlers(
	controlUnit: Unit | ExtendedOption,
	state: State,
	setState: ( setter: State | SetterFunc, options?: CreateOptions, meta?: SetValueMeta ) => void,
	popupState: PopupState,
	anchorRef?: RefObject< HTMLDivElement | null >
) {
	const handleUnitChange = useCallback(
		( newUnit: Unit | ExtendedOption ) => {
			if ( newUnit === 'custom' ) {
				popupState.open( anchorRef?.current );
			}

			setState( ( prev ) => ( { ...prev, unit: newUnit } ) );
		},
		[ setState, popupState, anchorRef ]
	);

	const handleSizeChange = useCallback(
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			const size = event.target.value;
			const isInputValid = event.target.validity.valid;

			if ( controlUnit === 'auto' ) {
				setState( ( prev ) => ( { ...prev, unit: controlUnit } ) );

				return;
			}

			setState(
				( prev ) => ( {
					...prev,
					[ controlUnit === 'custom' ? 'custom' : 'numeric' ]: formatSize( size, controlUnit ),
					unit: controlUnit,
				} ),
				undefined,
				{ validation: () => isInputValid }
			);
		},
		[ controlUnit, setState ]
	);

	const onInputClick = useCallback(
		( event: React.MouseEvent ) => {
			if ( ( event.target as HTMLElement ).closest( 'input' ) && 'custom' === state.unit ) {
				popupState.open( anchorRef?.current );
			}
		},
		[ state.unit, popupState, anchorRef ]
	);

	return {
		handleUnitChange,
		handleSizeChange,
		onInputClick,
	};
}
