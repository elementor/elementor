import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { type Suggestion } from '../../hooks/use-form-field-suggestions';
import { MentionTextAreaControl } from '../mention-text-area-control';

jest.mock( 'primereact/mention', () => ( {
	Mention: ( {
		value,
		onChange,
		onSearch,
		disabled,
		placeholder,
		rows,
		...rest
	}: {
		value: string;
		onChange: ( e: React.ChangeEvent< HTMLTextAreaElement > ) => void;
		onSearch: ( event: { query: string } ) => void;
		disabled?: boolean;
		placeholder?: string;
		rows?: number;
		[ key: string ]: unknown;
	} ) => (
		<textarea
			value={ value }
			onChange={ ( e ) => {
				onChange( e );

				const cursorPos = e.target.selectionStart;
				const textBeforeCursor = e.target.value.slice( 0, cursorPos );
				const triggerMatch = textBeforeCursor.match( /@(\w*)$/ );

				if ( triggerMatch ) {
					onSearch( { query: triggerMatch[ 1 ] } );
				}
			} }
			disabled={ disabled }
			placeholder={ placeholder }
			rows={ rows }
			aria-label={ rest[ 'aria-label' ] as string }
		/>
	),
} ) );

const propType = createMockPropType( { kind: 'plain' } );

const suggestions: Suggestion[] = [
	{ label: 'Name', value: 'name' },
	{ label: 'Email Address', value: 'email' },
	{ label: 'Phone', value: 'phone' },
];

describe( 'MentionTextAreaControl', () => {
	it( 'should render with the initial value', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'string', value: 'Hello' }, bind: 'message', propType };

		// Act.
		renderControl( <MentionTextAreaControl suggestions={ suggestions } />, props );
		const textarea = screen.getByRole( 'textbox' );

		// Assert.
		expect( textarea ).toHaveValue( 'Hello' );
	} );

	it( 'should transform mentions to shortcodes on change', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'string', value: '' }, bind: 'message', propType };

		renderControl( <MentionTextAreaControl suggestions={ suggestions } />, props );
		const textarea = screen.getByRole( 'textbox' );

		// Act.
		fireEvent.change( textarea, { target: { value: 'Hello @name thanks' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'Hello [name] thanks',
		} );
	} );

	it( 'should transform multiple mentions to shortcodes', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'string', value: '' }, bind: 'message', propType };

		renderControl( <MentionTextAreaControl suggestions={ suggestions } />, props );
		const textarea = screen.getByRole( 'textbox' );

		// Act.
		fireEvent.change( textarea, { target: { value: '@name and @email' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: '[name] and [email]',
		} );
	} );

	it( 'should not transform text that is not a mention', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'string', value: '' }, bind: 'message', propType };

		renderControl( <MentionTextAreaControl suggestions={ suggestions } />, props );
		const textarea = screen.getByRole( 'textbox' );

		// Act.
		fireEvent.change( textarea, { target: { value: 'Hello world' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'Hello world',
		} );
	} );
} );
