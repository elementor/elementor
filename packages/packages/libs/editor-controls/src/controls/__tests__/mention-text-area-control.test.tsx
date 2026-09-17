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
		trigger,
		...rest
	}: {
		value: string;
		onChange: ( e: React.ChangeEvent< HTMLTextAreaElement > ) => void;
		onSearch: ( event: { originalEvent: React.SyntheticEvent; trigger: string; query: string } ) => void;
		disabled?: boolean;
		placeholder?: string;
		rows?: number;
		trigger?: string;
		[ key: string ]: unknown;
	} ) => (
		<textarea
			value={ value }
			onChange={ ( e ) => {
				onChange( e );

				const cursorPos = e.target.selectionStart;
				const textBeforeCursor = e.target.value.slice( 0, cursorPos );
				const triggerChar = trigger ?? '@';
				const triggerMatch = textBeforeCursor.match( new RegExp( `${ triggerChar }(\\w*)$` ) );

				if ( triggerMatch ) {
					onSearch( {
						originalEvent: { target: e.target } as unknown as React.SyntheticEvent,
						trigger: triggerChar,
						query: triggerMatch[ 1 ],
					} );
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
		fireEvent.change( textarea, { target: { value: 'Hello name email' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'Hello name email',
		} );
	} );

	it( 'should pass rows prop to textarea', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'string', value: '' }, bind: 'message', propType };

		// Act.
		renderControl( <MentionTextAreaControl suggestions={ suggestions } rows={ 1 } />, props );
		const textarea = screen.getByRole( 'textbox' );

		// Assert.
		expect( textarea ).toHaveAttribute( 'rows', '1' );
	} );

	it( 'should transform mention when triggerPosition is start and @ is at position 0', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'string', value: '' }, bind: 'reply-to', propType };

		renderControl(
			<MentionTextAreaControl suggestions={ suggestions } triggerPosition="start" rows={ 1 } />,
			props
		);
		const textarea = screen.getByRole( 'textbox' );

		// Act.
		fireEvent.change( textarea, { target: { value: '@email', selectionStart: 6 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: '[email]',
		} );
	} );

	it( 'should not transform mention when triggerPosition is start and @ is not at position 0', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'string', value: '' }, bind: 'reply-to', propType };

		renderControl(
			<MentionTextAreaControl suggestions={ suggestions } triggerPosition="start" rows={ 1 } />,
			props
		);
		const textarea = screen.getByRole( 'textbox' );

		// Act.
		fireEvent.change( textarea, { target: { value: 'user@email', selectionStart: 10 } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'user@email',
		} );
	} );
} );
