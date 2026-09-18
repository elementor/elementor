import * as React from 'react';
import { useState } from 'react';
import { numberPropTypeUtil, type PropType } from '@elementor/editor-props';
import { InputAdornment, Typography } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { NumberInput } from '../components/number-input';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { clamp, isEmptyDraft, isInRange, parseNumberDraft } from '../utils/number-value';

const isEmptyOrNaN = ( value?: string | number | null ) =>
	value === null || value === undefined || value === '' || Number.isNaN( Number( value ) );

const renderSuffix = ( propType: PropType ) => {
	if ( propType.meta?.suffix ) {
		return (
			<InputAdornment position="end">
				<Typography variant="caption" color="text.secondary">
					{ propType.meta.suffix as string }
				</Typography>
			</InputAdornment>
		);
	}
	return <></>;
};

export const NumberControl = createControl(
	( {
		placeholder: labelPlaceholder,
		max: maxProp,
		min: minProp,
		step: stepProp,
		shouldForceInt = false,
		startIcon,
		disabled: inputDisabled,
	}: {
		placeholder?: string;
		max?: number | null;
		min?: number | null;
		step?: number | null;
		shouldForceInt?: boolean;
		startIcon?: React.ReactNode;
		disabled?: boolean;
	} ) => {
		const max = maxProp ?? Number.MAX_SAFE_INTEGER;
		const min = minProp ?? -Number.MAX_SAFE_INTEGER;
		const step = stepProp ?? 1;
		const { value, setValue, placeholder, disabled, restoreValue, propType } = useBoundProp( numberPropTypeUtil );

		// `null` means "not editing" — the input mirrors the bound value.
		const [ draft, setDraft ] = useState< string | null >( null );

		const handleInput = ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const raw = event.target.value;

			setDraft( raw );

			if ( isEmptyDraft( raw ) ) {
				setValue( null );

				return;
			}

			const parsed = parseNumberDraft( raw, shouldForceInt );

			// Type-required: `isInRange` and `clamp` both take a number.
			if ( parsed === null ) {
				return;
			}

			if ( isInRange( parsed, min, max ) ) {
				setValue( parsed );
			}
		};

		const handleBlur = () => {
			const raw = draft;

			setDraft( null );
			restoreValue();

			if ( raw === null ) {
				return;
			}

			if ( isEmptyDraft( raw ) ) {
				if ( ! propType.settings.required ) {
					setValue( null );
				}

				return;
			}

			const parsed = parseNumberDraft( raw, shouldForceInt );

			// As above — falling through would commit `clamp( null, … )`, a value never typed.
			if ( parsed === null ) {
				return;
			}

			// handleInput already committed anything in range; re-committing adds a redundant
			// store write and, past the history debounce, a no-op undo step.
			if ( isInRange( parsed, min, max ) ) {
				return;
			}

			setValue( clamp( parsed, min, max ) );
		};

		const displayValue = draft ?? ( isEmptyOrNaN( value ) ? '' : String( value ) );

		return (
			<ControlActions>
				<NumberInput
					size="tiny"
					type="number"
					fullWidth
					disabled={ inputDisabled ?? disabled }
					value={ displayValue }
					onInput={ handleInput }
					onBlur={ handleBlur }
					placeholder={ labelPlaceholder ?? ( isEmptyOrNaN( placeholder ) ? '' : String( placeholder ) ) }
					inputProps={ { step, min, ...( maxProp !== null && maxProp !== undefined && { max } ) } }
					InputProps={ {
						startAdornment: startIcon ? (
							<InputAdornment position="start" disabled={ inputDisabled ?? disabled }>
								{ startIcon }
							</InputAdornment>
						) : undefined,
						endAdornment: renderSuffix( propType ),
					} }
				/>
			</ControlActions>
		);
	}
);
