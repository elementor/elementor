import * as React from 'react';
import { useCallback, useState } from 'react';
import { Mention } from 'primereact/mention';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { styled } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { type Suggestion } from '../hooks/use-form-field-suggestions';

const MentionWrapper = styled( 'div' )( ( { theme } ) => ( {
	position: 'relative',
	'& .p-mention': {
		width: '100%',
		position: 'relative',
	},
	'& textarea': {
		width: '100%',
		boxSizing: 'border-box',
		fontFamily: 'inherit',
		fontSize: theme.typography.pxToRem( 12 ),
		lineHeight: 1.4375,
		padding: '4px 8px',
		borderRadius: theme.shape.borderRadius,
		border: `1px solid ${ theme.palette.divider }`,
		backgroundColor: 'transparent',
		color: 'inherit',
		resize: 'vertical',
		outline: 'none',
		transition: 'border-color 150ms ease-in-out',
		'&:hover': {
			borderColor: theme.palette.action.active,
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
		maxWidth: '100%',
		right: 0,
		left: 'auto !important',
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
	'&[data-single-line="true"] textarea': {
		resize: 'none',
	},
} ) );

type TriggerPosition = 'start' | 'auto';

function createMentionPattern( value: string, triggerPosition: TriggerPosition ): RegExp {
	const escaped = value.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
	const prefix = 'start' === triggerPosition ? '^' : '';

	return new RegExp( `${ prefix }@${ escaped }(?=\\s|$|[^a-zA-Z0-9_-])`, 'g' );
}

type Props = {
	placeholder?: string;
	ariaLabel?: string;
	suggestions: Suggestion[];
	rows?: number;
	triggerPosition?: TriggerPosition;
};

export const MentionTextAreaControl = createControl(
	( { placeholder, ariaLabel, suggestions: allSuggestions, rows = 5, triggerPosition = 'auto' }: Props ) => {
		const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );
		const [ filteredSuggestions, setFilteredSuggestions ] = useState< Suggestion[] >( [] );

		const transformMentionsToShortcodes = useCallback(
			( text: string ): string => {
				let result = text;

				for ( const suggestion of allSuggestions ) {
					const pattern = createMentionPattern( suggestion.value, triggerPosition );
					result = result.replace( pattern, `[${ suggestion.value }]` );
				}

				return result;
			},
			[ allSuggestions, triggerPosition ]
		);

		const handleChange = useCallback(
			( e: React.FormEvent< HTMLInputElement > ) => {
				const rawValue = ( e.target as HTMLTextAreaElement ).value;
				const transformed = transformMentionsToShortcodes( rawValue );
				setValue( transformed );
			},
			[ setValue, transformMentionsToShortcodes ]
		);

		const handleSearch = useCallback(
			( event: { originalEvent: React.SyntheticEvent; trigger: string; query: string } ) => {
				if ( 'start' === triggerPosition ) {
					const target = event.originalEvent.target as HTMLTextAreaElement;
					const triggerIndex = target.selectionStart - event.query.length - event.trigger.length;

					if ( triggerIndex !== 0 ) {
						setFilteredSuggestions( [] );
						return;
					}
				}

				const query = event.query.toLowerCase();
				const filtered = allSuggestions.filter(
					( item ) => item.label.toLowerCase().includes( query ) || item.value.toLowerCase().includes( query )
				);
				setFilteredSuggestions( filtered );
			},
			[ allSuggestions, triggerPosition ]
		);

		return (
			<ControlActions>
				<MentionWrapper data-single-line={ rows === 1 ? 'true' : undefined }>
					<Mention
						value={ value ?? '' }
						onChange={ handleChange }
						suggestions={ filteredSuggestions }
						onSearch={ handleSearch }
						field="value"
						trigger="@"
						rows={ rows }
						disabled={ disabled }
						placeholder={ placeholder }
						itemTemplate={ SuggestionItem }
						{ ...( ariaLabel ? { 'aria-label': ariaLabel } : {} ) }
					/>
				</MentionWrapper>
			</ControlActions>
		);
	}
);

const SuggestionItem = ( suggestion: Suggestion ) => <span>{ suggestion.label }</span>;
