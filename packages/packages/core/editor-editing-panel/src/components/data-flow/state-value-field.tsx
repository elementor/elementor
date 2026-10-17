import * as React from 'react';
import { useState } from 'react';
import { type ElementStateParamType } from '@elementor/editor-elements';
import { TextField } from '@elementor/ui';

import { formatStateValue, parseStateInput } from './state-values';

type StateValueFieldProps = {
	label: string;
	type: ElementStateParamType;
	value: unknown;
	placeholder?: string;
	onChange: ( input: string, value: unknown ) => void;
};

export const StateValueField = ( { label, type, value, placeholder, onChange }: StateValueFieldProps ) => {
	const [ input, setInput ] = useState( () => formatStateValue( value ) );

	return (
		<TextField
			size="tiny"
			fullWidth
			value={ input }
			placeholder={ placeholder }
			inputProps={ { 'aria-label': label, spellCheck: false } }
			onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => {
				setInput( event.target.value );
				onChange( event.target.value, parseStateInput( event.target.value, type ) );
			} }
		/>
	);
};
