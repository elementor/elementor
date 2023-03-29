import { renderHook } from '@testing-library/react-hooks';
import useActiveDocumentActions from '../use-active-document-actions';
import { openRoute, runCommand } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters' );

describe( '@elementor/documents - useActiveDocumentActions', () => {
	it( 'should run documents actions', () => {
		// Arrange.
		const { result } = renderHook( () => useActiveDocumentActions() );

		const {
			save,
			saveDraft,
			saveTemplate,
		} = result.current;

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
		const { result, rerender } = renderHook( () => useActiveDocumentActions() );

		const {
			save,
			saveDraft,
			saveTemplate,
		} = result.current;

		// Act.
		rerender();

		// Assert.
		expect( result.current.save ).toBe( save );
		expect( result.current.saveDraft ).toBe( saveDraft );
		expect( result.current.saveTemplate ).toBe( saveTemplate );
	} );
} );
