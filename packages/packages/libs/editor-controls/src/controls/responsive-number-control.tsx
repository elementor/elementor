import * as React from 'react';
import { resolveResponsiveValue, responsivePropTypeUtil, type ResponsivePropValue } from '@elementor/editor-props';
import { useActiveBreakpoint, useBreakpoints } from '@elementor/editor-responsive';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { createControl } from '../create-control';
import { NumberControl } from './number-control';

export const ResponsiveNumberControl = createControl(
	( {
		placeholder: labelPlaceholder,
		max,
		min,
		step,
		shouldForceInt,
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
		const { value, setValue, propType, placeholder, disabled } = useBoundProp( responsivePropTypeUtil );
		const breakpoint = useActiveBreakpoint() ?? 'desktop';
		const activeBreakpoints = ( useBreakpoints() ?? [] ).map( ( item ) => item.id );

		const inherited = resolveResponsiveValue( value, breakpoint, activeBreakpoints );
		const inheritedPlaceholder =
			inherited === null || inherited === undefined || inherited === '' ? undefined : String( inherited );

		return (
			<PropProvider
				propType={ propType }
				value={ value }
				setValue={ ( next ) => setValue( next as ResponsivePropValue[ 'value' ] ) }
				placeholder={ placeholder }
			>
				<PropKeyProvider bind={ breakpoint }>
					<NumberControl
						placeholder={ labelPlaceholder ?? inheritedPlaceholder }
						max={ max }
						min={ min }
						step={ step }
						shouldForceInt={ shouldForceInt }
						startIcon={ startIcon }
						disabled={ inputDisabled ?? disabled }
					/>
				</PropKeyProvider>
			</PropProvider>
		);
	}
);
