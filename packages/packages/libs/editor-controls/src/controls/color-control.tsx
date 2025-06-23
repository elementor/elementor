import * as React from 'react';
import { colorPropTypeUtil, type PropTypeUtil } from '@elementor/editor-props';
import { UnstableColorField, type UnstableColorFieldProps } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type Props = Partial< Omit< UnstableColorFieldProps, 'value' | 'onChange' > > & {
	propTypeUtil?: PropTypeUtil< string, string >;
	anchorEl?: HTMLElement | null;
};

export const ColorControl = createControl(
	( { propTypeUtil = colorPropTypeUtil, anchorEl, slotProps = {}, ...props }: Props ) => {
		const { value, setValue, disabled } = useBoundProp( propTypeUtil );

		const handleChange = ( selectedColor: string ) => {
			setValue( selectedColor || null );
		};

		return (
			<ControlActions>
				<UnstableColorField
					size="tiny"
					fullWidth
					value={ value ?? '' }
					onChange={ handleChange }
					{ ...props }
					disabled={ disabled }
					slotProps={ {
						...slotProps,
						colorPicker: {
							anchorEl,
							anchorOrigin: {
								vertical: 'top',
								horizontal: 'right',
							},
							transformOrigin: {
								vertical: 'top',
								horizontal: -10,
							},
						},
					} }
				/>
			</ControlActions>
		);
	}
);
