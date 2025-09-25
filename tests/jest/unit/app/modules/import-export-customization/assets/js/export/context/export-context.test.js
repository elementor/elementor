import { renderHook, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import { ExportContextProvider, useExportContext, EXPORT_STATUS } from 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context';

const createWrapper = () => {
	const Wrapper = ( { children } ) => (
		<ExportContextProvider>
			{ children }
		</ExportContextProvider>
	);

	Wrapper.propTypes = {
		children: PropTypes.node.isRequired,
	};

	return Wrapper;
};

describe( 'Export Context', () => {
	describe( 'Initial State', () => {
		it( 'should initialize with default export settings', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			expect( result ).toMatchObject( {
				current: {
					data: {
						exportStatus: EXPORT_STATUS.PENDING,
						includes: [ 'content', 'templates', 'settings', 'plugins' ],
						kitInfo: {
							title: null,
							description: null,
							source: null,
						},
						plugins: [],
						exportedData: null,
					},
				},
			} );
		} );

		it( 'should correctly calculate template name validity', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.isTemplateNameValid ).toBe( false );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: 'My Kit' } );
			} );

			expect( result.current.isTemplateNameValid ).toBe( true );
		} );

		it( 'should correctly calculate export status flags', () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			expect( result ).toMatchObject( {
				current: {
					isPending: true,
					isExporting: false,
					isCompleted: false,
				},
			} );
		} );
	} );

	describe( 'Kit Information Management', () => {
		it( 'should update kit title correctly', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: 'My Custom Kit' } );
			} );

			expect( result.current.data.kitInfo.title ).toBe( 'My Custom Kit' );
		} );

		it( 'should update kit description correctly', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_KIT_DESCRIPTION', payload: 'Kit description' } );
			} );

			expect( result.current.data.kitInfo.description ).toBe( 'Kit description' );
		} );

		it( 'should update kit source correctly for cloud export', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'cloud' } );
			} );

			expect( result.current.data.kitInfo.source ).toBe( 'cloud' );
		} );

		it( 'should update kit source correctly for file export', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'file' } );
			} );

			expect( result.current.data.kitInfo.source ).toBe( 'file' );
		} );
	} );

	describe( 'Export Status Management', () => {
		it( 'should transition from pending to exporting status', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.EXPORTING } );
			} );

			expect( result ).toMatchObject( {
				current: {
					data: {
						exportStatus: EXPORT_STATUS.EXPORTING,
					},
					isPending: false,
					isExporting: true,
					isCompleted: false,
				},
			} );
		} );

		it( 'should transition from exporting to completed status', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.COMPLETED } );
			} );

			expect( result ).toMatchObject( {
				current: {
					data: {
						exportStatus: EXPORT_STATUS.COMPLETED,
					},
					isPending: false,
					isExporting: false,
					isCompleted: true,
				},
			} );
		} );
	} );

	describe( 'Include Items Management', () => {
		it( 'should add new include item when not present', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'ADD_INCLUDE', payload: 'widgets' } );
			} );

			expect( result.current.data.includes ).toEqual( [ 'content', 'templates', 'settings', 'plugins', 'widgets' ] );
		} );

		it( 'should not duplicate include items', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'ADD_INCLUDE', payload: 'content' } );
			} );

			// Should still have the same items without duplicates
			expect( result.current.data.includes ).toEqual( [ 'content', 'templates', 'settings', 'plugins' ] );
		} );

		it( 'should remove include item when present', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'REMOVE_INCLUDE', payload: 'content' } );
			} );

			expect( result.current.data.includes ).toEqual( [ 'templates', 'settings', 'plugins' ] );
		} );

		it( 'should handle removing non-existent include item', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'REMOVE_INCLUDE', payload: 'non-existent' } );
			} );

			expect( result.current.data.includes ).toEqual( [ 'content', 'templates', 'settings', 'plugins' ] );
		} );

		it( 'should clear customization when removing include item', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( {
					type: 'SET_CUSTOMIZATION',
					payload: { key: 'content', value: { selectedPosts: [ 1, 2, 3 ] } },
				} );
			} );

			expect( result.current.data.customization.content ).toEqual( { selectedPosts: [ 1, 2, 3 ] } );

			await waitFor( () => {
				result.current.dispatch( { type: 'REMOVE_INCLUDE', payload: 'content' } );
			} );

			expect( result.current.data.includes ).toEqual( [ 'templates', 'settings', 'plugins' ] );
			expect( result.current.data.customization.content ).toBeNull();
		} );
	} );

	describe( 'Export Data Management', () => {
		it( 'should store exported data correctly', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			const mockExportedData = {
				file: 'base64encodeddata',
				manifest: { version: '1.0' },
			};

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_EXPORTED_DATA', payload: mockExportedData } );
			} );

			expect( result.current.data.exportedData ).toEqual( mockExportedData );
		} );

		it( 'should store plugins list correctly', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			const mockPlugins = [
				{ name: 'plugin1', version: '1.0' },
				{ name: 'plugin2', version: '2.0' },
			];

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_PLUGINS', payload: mockPlugins } );
			} );

			expect( result.current.data.plugins ).toEqual( mockPlugins );
		} );

		it( 'should store download URL correctly', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			const downloadUrl = 'https://example.com/download/kit.zip';

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_DOWNLOAD_URL', payload: downloadUrl } );
			} );

			expect( result.current.data.downloadUrl ).toBe( downloadUrl );
		} );
	} );

	describe( 'Template Name Validation', () => {
		it( 'should validate empty title as invalid', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: '' } );
			} );

			expect( result.current.isTemplateNameValid ).toBe( false );
		} );

		it( 'should validate whitespace-only title as invalid', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: '   ' } );
			} );

			expect( result.current.isTemplateNameValid ).toBe( false );
		} );

		it( 'should validate proper title as valid', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: 'My Kit' } );
			} );

			expect( result.current.isTemplateNameValid ).toBe( true );
		} );
	} );
} );
