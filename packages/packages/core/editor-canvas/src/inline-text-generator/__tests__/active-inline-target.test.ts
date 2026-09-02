import { type Editor } from '@tiptap/react';

import { getActiveInlineTarget, setActiveInlineTarget, snapshotActiveInlineTarget } from '../active-inline-target';

const createMockEditor = (): Editor =>
	( {
		getHTML: jest.fn().mockReturnValue( '<p>Updated</p>' ),
	} ) as unknown as Editor;

describe( 'activeInlineTarget', () => {
	it( 'should store and return the active inline target', () => {
		// Arrange.
		const target = {
			elementId: 'element-1',
			bind: 'title',
			html: '<p>Hello</p>',
			source: 'panel' as const,
		};

		// Act.
		setActiveInlineTarget( target );

		// Assert.
		expect( getActiveInlineTarget() ).toEqual( target );
	} );

	it( 'should snapshot html from the editor on demand', () => {
		// Arrange.
		const editor = createMockEditor();

		// Act.
		snapshotActiveInlineTarget( {
			editor,
			elementId: 'element-2',
			bind: 'paragraph',
			html: '<p>Stale</p>',
			source: 'canvas',
		} );

		// Assert.
		expect( getActiveInlineTarget() ).toEqual( {
			elementId: 'element-2',
			bind: 'paragraph',
			html: '<p>Updated</p>',
			source: 'canvas',
		} );
	} );
} );
