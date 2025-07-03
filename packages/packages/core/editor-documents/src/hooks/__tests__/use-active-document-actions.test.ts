import { renderHookWithStore } from 'test-utils';
import { __privateOpenRoute as openRoute, __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __createStore, __registerSlice, type SliceState, type Store } from '@elementor/store';

import { slice } from '../../store';
import useActiveDocumentActions from '../use-active-document-actions';

jest.mock( '@elementor/editor-v1-adapters' );

describe( '@elementor/editor-documents - useActiveDocumentActions', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();
	} );

	it( 'should run documents actions', () => {
		// Arrange.
		const { result } = renderHookWithStore( useActiveDocumentActions, store );

		const { save, saveDraft, saveTemplate } = result.current;

		// Act.
		save();
		saveDraft();
		saveTemplate();

		// Assert.
		expect( runCommand ).toHaveBeenCalledTimes( 2 );

		expect( runCommand ).toHaveBeenNthCalledWith( 1, 'document/save/default' );
		expect( runCommand ).toHaveBeenNthCalledWith( 2, 'document/save/draft' );

		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( 'library/save-template' );
	} );

	it( 'should return memoized callbacks', () => {
		// Arrange.
		const { result, rerender } = renderHookWithStore( useActiveDocumentActions, store );

		const { save, saveDraft, saveTemplate } = result.current;

		// Act.
		rerender();

		// Assert.
		expect( result.current.save ).toBe( save );
		expect( result.current.saveDraft ).toBe( saveDraft );
		expect( result.current.saveTemplate ).toBe( saveTemplate );
	} );
} );
