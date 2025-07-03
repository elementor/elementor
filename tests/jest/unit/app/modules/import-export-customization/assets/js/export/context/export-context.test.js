import { renderHook, act } from '@testing-library/react';
import { ExportContextProvider, useExportContext, EXPORT_STATUS } from 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context';

const createWrapper = () => {
	return ( { children } ) => (
		<ExportContextProvider>
			{ children }
		</ExportContextProvider>
	);
};

describe( 'Export Context', () => {
	describe( 'Initial State', () => {
		it( 'should initialize with default export settings', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.data.exportStatus ).toBe( EXPORT_STATUS.PENDING );
			expect( result.current.data.includes ).toEqual( [ 'content', 'templates', 'settings', 'plugins' ] );
			expect( result.current.data.kitInfo.title ).toBeNull();
			expect( result.current.data.kitInfo.description ).toBeNull();
			expect( result.current.data.kitInfo.source ).toBeNull();
			expect( result.current.data.plugins ).toEqual( [] );
			expect( result.current.data.exportedData ).toBeNull();
		} );

		it( 'should correctly calculate template name validity', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.isTemplateNameValid ).toBe( false );

			act( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: 'My Kit' } );
			} );

			expect( result.current.isTemplateNameValid ).toBe( true );
		} );

		it( 'should correctly calculate export status flags', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.isPending ).toBe( true );
			expect( result.current.isExporting ).toBe( false );
			expect( result.current.isCompleted ).toBe( false );
		} );
	} );

	describe( 'Kit Information Management', () => {
		it( 'should update kit title correctly', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: 'My Custom Kit' } );
			} );

			expect( result.current.data.kitInfo.title ).toBe( 'My Custom Kit' );
		} );

		it( 'should update kit description correctly', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'SET_KIT_DESCRIPTION', payload: 'Kit description' } );
			} );

			expect( result.current.data.kitInfo.description ).toBe( 'Kit description' );
		} );

		it( 'should update kit source correctly for cloud export', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'cloud' } );
			} );

			expect( result.current.data.kitInfo.source ).toBe( 'cloud' );
		} );

		it( 'should update kit source correctly for file export', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'file' } );
			} );

			expect( result.current.data.kitInfo.source ).toBe( 'file' );
		} );
	} );

	describe( 'Export Status Management', () => {
		it( 'should transition from pending to exporting status', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.EXPORTING } );
			} );

			expect( result.current.data.exportStatus ).toBe( EXPORT_STATUS.EXPORTING );
			expect( result.current.isPending ).toBe( false );
			expect( result.current.isExporting ).toBe( true );
			expect( result.current.isCompleted ).toBe( false );
		} );

		it( 'should transition from exporting to completed status', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.COMPLETED } );
			} );

			expect( result.current.data.exportStatus ).toBe( EXPORT_STATUS.COMPLETED );
			expect( result.current.isPending ).toBe( false );
			expect( result.current.isExporting ).toBe( false );
			expect( result.current.isCompleted ).toBe( true );
		} );
	} );

	describe( 'Include Items Management', () => {
		it( 'should add new include item when not present', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			// Remove all default includes first
			act( () => {
				result.current.dispatch( { type: 'REMOVE_INCLUDE', payload: 'content' } );
				result.current.dispatch( { type: 'REMOVE_INCLUDE', payload: 'templates' } );
				result.current.dispatch( { type: 'REMOVE_INCLUDE', payload: 'settings' } );
				result.current.dispatch( { type: 'REMOVE_INCLUDE', payload: 'plugins' } );
			} );

			expect( result.current.data.includes ).toEqual( [] );

			act( () => {
				result.current.dispatch( { type: 'ADD_INCLUDE', payload: 'content' } );
			} );

			expect( result.current.data.includes ).toEqual( [ 'content' ] );
		} );

		it( 'should not duplicate include items', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'ADD_INCLUDE', payload: 'content' } );
			} );

			// Should still have the same items without duplicates
			expect( result.current.data.includes ).toEqual( [ 'content', 'templates', 'settings', 'plugins' ] );
		} );

		it( 'should remove include item when present', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'REMOVE_INCLUDE', payload: 'content' } );
			} );

			expect( result.current.data.includes ).toEqual( [ 'templates', 'settings', 'plugins' ] );
		} );

		it( 'should handle removing non-existent include item', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'REMOVE_INCLUDE', payload: 'non-existent' } );
			} );

			expect( result.current.data.includes ).toEqual( [ 'content', 'templates', 'settings', 'plugins' ] );
		} );
	} );

	describe( 'Export Data Management', () => {
		it( 'should store exported data correctly', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			const mockExportedData = {
				file: 'base64encodeddata',
				manifest: { version: '1.0' },
			};

			act( () => {
				result.current.dispatch( { type: 'SET_EXPORTED_DATA', payload: mockExportedData } );
			} );

			expect( result.current.data.exportedData ).toEqual( mockExportedData );
		} );

		it( 'should store plugins list correctly', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			const mockPlugins = [
				{ name: 'plugin1', version: '1.0' },
				{ name: 'plugin2', version: '2.0' },
			];

			act( () => {
				result.current.dispatch( { type: 'SET_PLUGINS', payload: mockPlugins } );
			} );

			expect( result.current.data.plugins ).toEqual( mockPlugins );
		} );

		it( 'should store download URL correctly', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			const downloadUrl = 'https://example.com/download/kit.zip';

			act( () => {
				result.current.dispatch( { type: 'SET_DOWNLOAD_URL', payload: downloadUrl } );
			} );

			expect( result.current.data.downloadUrl ).toBe( downloadUrl );
		} );
	} );

	describe( 'Template Name Validation', () => {
		it( 'should validate empty title as invalid', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: '' } );
			} );

			expect( result.current.isTemplateNameValid ).toBe( false );
		} );

		it( 'should validate whitespace-only title as invalid', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: '   ' } );
			} );

			expect( result.current.isTemplateNameValid ).toBe( false );
		} );

		it( 'should validate proper title as valid', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: 'My Kit' } );
			} );

			expect( result.current.isTemplateNameValid ).toBe( true );
		} );

		it( 'should validate title with leading/trailing spaces as valid', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			act( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: '  My Kit  ' } );
			} );

			expect( result.current.isTemplateNameValid ).toBe( true );
		} );
	} );

	describe( 'Context Provider Error Handling', () => {
		it( 'should throw error when useExportContext is used outside provider', () => {
			const originalError = console.error;
			console.error = jest.fn();

			expect( () => {
				renderHook( () => useExportContext() );
			} ).toThrow( 'useExportContext must be used within an ExportContextProvider' );

			console.error = originalError;
		} );
	} );
} );
