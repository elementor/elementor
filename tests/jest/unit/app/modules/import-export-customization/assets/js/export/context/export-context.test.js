import { renderHook, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import { ExportContextProvider, useExportContext, EXPORT_STATUS } from 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context';
import { useKitValidation } from 'elementor/app/modules/import-export-customization/assets/js/export/hooks/use-kit-validation';

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

		it( 'should correctly calculate validation errors using validation hook', async () => {
			const { result } = renderHook( () => {
				const exportContext = useExportContext();
				const validationHook = useKitValidation();
				return { exportContext, validationHook };
			}, {
				wrapper: createWrapper(),
			} );

			expect( result.current.exportContext.hasValidationErrors ).toBe( true );
			expect( result.current.validationHook.nameError ).toBeTruthy();

			expect( result.current.validationHook.validateKitName( '' ) ).toBeTruthy();
			expect( result.current.validationHook.validateKitName( 'Valid Name' ) ).toBeNull();

			await waitFor( () => {
				result.current.exportContext.dispatch( { type: 'SET_KIT_TITLE', payload: 'My Kit' } );
			} );

			await waitFor( () => {
				expect( result.current.exportContext.hasValidationErrors ).toBe( false );
				expect( result.current.validationHook.nameError ).toBeNull();
			} );
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

			expect( result.current.hasValidationErrors ).toBe( true );
		} );

		it( 'should validate whitespace-only title as invalid', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: '   ' } );
			} );

			expect( result.current.hasValidationErrors ).toBe( true );
		} );

		it( 'should validate proper title as valid', async () => {
			const { result } = renderHook( () => useExportContext(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				result.current.dispatch( { type: 'SET_KIT_TITLE', payload: 'My Kit' } );
			} );

			expect( result.current.hasValidationErrors ).toBe( false );
		} );
	} );

	describe( 'Kit Validation Hook', () => {
		it( 'should validate special characters in kit name', () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const validateKitName = result.current.validateKitName;

			// Test special characters that should be rejected
			expect( validateKitName( 'Kit<Name>' ) ).toBeTruthy();
			expect( validateKitName( 'Kit"Name"' ) ).toBeTruthy();
			expect( validateKitName( 'Kit|Name' ) ).toBeTruthy();
			expect( validateKitName( 'Kit?Name' ) ).toBeTruthy();
			expect( validateKitName( 'Kit*Name' ) ).toBeTruthy();

			// Test valid characters that should be accepted
			expect( validateKitName( 'My Kit Name' ) ).toBeNull();
			expect( validateKitName( 'Kit-Name_123' ) ).toBeNull();
			expect( validateKitName( 'Kit.Name(1)' ) ).toBeNull();
		} );

		it( 'should validate description length', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const validateDescription = result.current.validateDescription;
			const DESCRIPTION_MAX_LENGTH = result.current.DESCRIPTION_MAX_LENGTH;

			// Test valid description
			expect( validateDescription( 'Short description' ) ).toBeNull();

			// Test description at exactly max length
			const exactLengthDescription = 'a'.repeat( DESCRIPTION_MAX_LENGTH );
			expect( validateDescription( exactLengthDescription ) ).toBeNull();

			// Test description exceeding max length
			const tooLongDescription = 'a'.repeat( DESCRIPTION_MAX_LENGTH + 1 );
			expect( validateDescription( tooLongDescription ) ).toBeTruthy();
		} );

		it( 'should handle description change validation', async () => {
			const { result } = renderHook( () => {
				const exportContext = useExportContext();
				const validationHook = useKitValidation();
				return { exportContext, validationHook };
			}, {
				wrapper: createWrapper(),
			} );

			// Set initial valid description
			await waitFor( () => {
				result.current.exportContext.dispatch( {
					type: 'SET_KIT_DESCRIPTION',
					payload: 'Valid description',
				} );
			} );

			expect( result.current.validationHook.hasDescriptionError ).toBe( false );
			expect( result.current.validationHook.descriptionCounterColor ).toBe( 'text.secondary' );

			// Set description that exceeds limit
			const longDescription = 'a'.repeat( 301 );
			await waitFor( () => {
				result.current.exportContext.dispatch( {
					type: 'SET_KIT_DESCRIPTION',
					payload: longDescription,
				} );
			} );

			await waitFor( () => {
				expect( result.current.validationHook.hasDescriptionError ).toBe( true );
				expect( result.current.validationHook.descriptionCounterColor ).toBe( 'error' );
				expect( result.current.exportContext.hasValidationErrors ).toBe( true );
			} );
		} );
	} );
} );
