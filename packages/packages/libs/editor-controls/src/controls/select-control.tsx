import * as React from 'react';
import { stringPropTypeUtil, type StringPropValue } from '@elementor/editor-props';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type Props = {
	options: Array< { label: string; value: StringPropValue[ 'value' ]; disabled?: boolean } >;
	onChange?: ( newValue: string | null, previousValue: string | null | undefined ) => void;
};

export const SelectControl = createControl( ( { options, onChange }: Props ) => {
	const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );

	const handleChange = ( event: SelectChangeEvent< StringPropValue[ 'value' ] > ) => {
		const newValue = event.target.value || null;

		onChange?.( newValue, value );
		setValue( newValue );
	};

	return (
		<ControlActions>
			<Select
				sx={ { overflow: 'hidden' } }
				displayEmpty
				size="tiny"
				value={ value ?? '' }
				onChange={ handleChange }
				disabled={ disabled }
				fullWidth
			>
				{ options.map( ( { label, ...props } ) => (
					<MenuListItem key={ props.value } { ...props } value={ props.value ?? '' }>
						{ label }
					</MenuListItem>
				) ) }
			</Select>
		</ControlActions>
	);
} );
