import * as React from 'react';
import { useCallback, useState } from 'react';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { styled } from '@elementor/ui';
import { Mention } from 'primereact/mention';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type Suggestion = {
	label: string;
	value: string;
};

const FIELD_SUGGESTIONS: Suggestion[] = [
	{ label: 'First Name', value: 'firstname' },
	{ label: 'Last Name', value: 'lastname' },
	{ label: 'Email', value: 'email' },
	{ label: 'Phone', value: 'phone' },
	{ label: 'All Fields', value: 'all-fields' },
];

const MentionWrapper = styled( 'div' )( ( { theme } ) => ( {
	'& .p-mention': {
		width: '100%',
	},
	'& textarea': {
		width: '100%',
		boxSizing: 'border-box',
		fontFamily: 'inherit',
		fontSize: theme.typography.pxToRem( 12 ),
		lineHeight: 1.4375,
		padding: '4px 8px',
		borderRadius: theme.shape.borderRadius,
		border: `1px solid rgba(255, 255, 255, 0.23)`,
		backgroundColor: 'transparent',
		color: 'inherit',
		resize: 'vertical',
		outline: 'none',
		transition: 'border-color 150ms ease-in-out',
		'&:hover': {
			borderColor: 'rgba(255, 255, 255, 0.6)',
		},
		'&:focus': {
			borderColor: theme.palette.primary.main,
			borderWidth: 2,
			padding: '3px 7px',
		},
		'&:disabled': {
			opacity: 0.38,
			cursor: 'default',
		},
		'&::placeholder': {
			color: 'inherit',
			opacity: 0.5,
		},
	},
	'& .p-mention-panel': {
		fontFamily: 'inherit',
		fontSize: theme.typography.pxToRem( 12 ),
		backgroundColor: theme.palette.background.paper,
		border: `1px solid ${ theme.palette.divider }`,
		borderRadius: theme.shape.borderRadius,
		boxShadow: theme.shadows[ 4 ],
		maxHeight: '200px',
		overflow: 'auto',
		zIndex: theme.zIndex.modal,
	},
	'& .p-mention-items': {
		listStyle: 'none',
		margin: 0,
		padding: '4px 0',
	},
	'& .p-mention-item': {
		padding: '6px 12px',
		cursor: 'pointer',
		color: theme.palette.text.primary,
		'&:hover': {
			backgroundColor: theme.palette.action.hover,
		},
		'&.p-highlight': {
			backgroundColor: theme.palette.action.selected,
		},
	},
} ) );

type Props = {
	placeholder?: string;
	ariaLabel?: string;
};

export const MentionTextAreaControl = createControl( ( { placeholder, ariaLabel }: Props ) => {
	const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );
	const [ suggestions, setSuggestions ] = useState< Suggestion[] >( [] );

	const handleChange = useCallback(
		( e: React.FormEvent< HTMLInputElement > ) => {
			setValue( ( e.target as HTMLTextAreaElement ).value );
		},
		[ setValue ],
	);

	const handleSearch = useCallback( ( event: { query: string } ) => {
		const query = event.query.toLowerCase();
		const filtered = FIELD_SUGGESTIONS.filter( ( item ) =>
			item.label.toLowerCase().includes( query ) || item.value.toLowerCase().includes( query ),
		);
		setSuggestions( filtered );
	}, [] );

	const itemTemplate = useCallback( ( suggestion: Suggestion ) => {
		return <span>{ suggestion.label } <small>(@{ suggestion.value })</small></span>;
	}, [] );

	return (
		<ControlActions>
			<MentionWrapper>
				<Mention
					value={ value ?? '' }
					onChange={ handleChange }
					suggestions={ suggestions }
					onSearch={ handleSearch }
					field="value"
					trigger="@"
					rows={ 5 }
					disabled={ disabled }
					placeholder={ placeholder }
					itemTemplate={ itemTemplate }
					{ ...( ariaLabel ? { 'aria-label': ariaLabel } : {} ) }
				/>
			</MentionWrapper>
		</ControlActions>
	);
} );
