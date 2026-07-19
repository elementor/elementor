import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { htmlV3PropTypeUtil, parseHtmlChildren, stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { InlineEditingControl } from '../inline-editing-control';

const propType = createMockPropType( { kind: 'plain', key: 'html-v3' } );
const wait = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

describe( 'InlineEditingControl html-v3 value updates', () => {
	it( 'should clear children when plain text replaces formatted content', () => {
		// Arrange.
		const staleChildren = [
			{
				id: 'e-old-child',
				type: 'strong',
				content: 'old',
			},
		];
		const previousValue = htmlV3PropTypeUtil.create( {
			content: stringPropTypeUtil.create( 'Hello <strong id="e-old-child">old</strong>' ),
			children: staleChildren,
		} );
		const { children: previousChildren } = previousValue.value;

		// Act.
		const { content: parsedContent, children: parsedChildren } = parseHtmlChildren( 'New plain text' );
		const nextValue = htmlV3PropTypeUtil.create( {
			content: parsedContent ? stringPropTypeUtil.create( parsedContent ) : null,
			children: parsedChildren,
		} );
		const { children: nextChildren, content: nextContent } = nextValue.value;

		// Assert.
		expect( previousChildren ).toEqual( staleChildren );
		expect( nextChildren ).toEqual( [] );
		expect( stringPropTypeUtil.extract( nextContent ) ).toBe( 'New plain text' );
	} );

	it( 'should produce normalized content and children ids on commit', () => {
		// Arrange.
		const rawHtml = '<p>hello <strong>bold</strong> </p>';

		// Act.
		const { content: parsedContent, children: parsedChildren } = parseHtmlChildren( rawHtml );

		// Assert.
		expect( parsedContent ).toContain( 'id="' );
		expect( parsedChildren.length ).toBe( 1 );
	} );

	it( 'should sync a single debounced update to the canvas while typing, not one per keystroke', async () => {
		// Arrange.
		const setValue = jest.fn();
		renderControl( <InlineEditingControl />, {
			bind: 'text',
			propType,
			value: htmlV3PropTypeUtil.create( { content: stringPropTypeUtil.create( '' ), children: [] } ),
			setValue,
		} );
		const editor = screen.getByRole( 'textbox' );
		fireEvent.focus( editor );

		// Act: simulate several rapid keystrokes.
		fireEvent.input( editor, { target: { textContent: 'H' } } );
		fireEvent.input( editor, { target: { textContent: 'He' } } );
		fireEvent.input( editor, { target: { textContent: 'Hel' } } );

		// Assert: exactly one sync for the whole burst of keystrokes, not per keystroke.
		await waitFor( () => {
			expect( setValue ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	it( 'should not keep syncing once typing stops (no idle flicker)', async () => {
		// Arrange.
		const setValue = jest.fn();
		renderControl( <InlineEditingControl />, {
			bind: 'text',
			propType,
			value: htmlV3PropTypeUtil.create( { content: stringPropTypeUtil.create( '' ), children: [] } ),
			setValue,
		} );
		const editor = screen.getByRole( 'textbox' );
		fireEvent.focus( editor );

		// Act.
		fireEvent.input( editor, { target: { textContent: 'Hello' } } );
		await waitFor( () => {
			expect( setValue ).toHaveBeenCalledTimes( 1 );
		} );

		// Assert: letting more time pass with no further input triggers no additional syncs.
		await wait( 500 );
		expect( setValue ).toHaveBeenCalledTimes( 1 );
	} );
} );
