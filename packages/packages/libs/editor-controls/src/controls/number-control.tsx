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
		max = Number.MAX_SAFE_INTEGER,
		min = -Number.MAX_SAFE_INTEGER,
		step = 1,
		shouldForceInt = false,
		startIcon,
		disabled: inputDisabled,
	}: {
		placeholder?: string;
		max?: number;
		min?: number;
		step?: number;
		shouldForceInt?: boolean;
		startIcon?: React.ReactNode;
		disabled?: boolean;
	} ) => {
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

			// A type="number" input sanitises non-numeric text to "" before we see it, so this
			// branch is unreachable today. Falling through would coerce null to 0 in the range
			// check and commit a value the user never typed.
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

			if ( parsed === null ) {
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
					inputProps={ { step, min } }
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
