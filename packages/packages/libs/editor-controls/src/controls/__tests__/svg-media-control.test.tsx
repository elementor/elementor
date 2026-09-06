import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';
import { type UseQueryResult } from '@elementor/query';
import { useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { useUnfilteredFilesUpload, useUpdateUnfilteredFilesUpload } from '../../hooks/use-unfiltered-files-upload';
import { enqueueIconFonts, openIconLibrary } from '../open-icon-library';
import { SvgMediaControl } from '../svg-media-control';

jest.mock( '../../hooks/use-unfiltered-files-upload' );
jest.mock( '../open-icon-library', () => {
	const actual = jest.requireActual( '../open-icon-library' );

	return {
		...actual,
		openIconLibrary: jest.fn(),
		enqueueIconFonts: jest.fn(),
	};
} );
jest.mock( '@elementor/wp-media', () => ( {
	useWpMediaAttachment: jest.fn(),
	useWpMediaFrame: jest.fn(),
} ) );
jest.mock( '@elementor/editor-current-user', () => ( {
	useCurrentUserCapabilities: jest.fn(),
} ) );

const propType = createMockPropType( {
	kind: 'object',
	key: 'image-src',
	shape: {
		id: createMockPropType( { kind: 'plain' } ),
		url: createMockPropType( { kind: 'plain' } ),
	},
} );

describe( 'SvgMediaControl', () => {
	beforeEach( () => {
		jest.mocked( useWpMediaAttachment ).mockReturnValue( {} as never );
		jest.mocked( useUnfilteredFilesUpload ).mockReturnValue( { data: true } as UseQueryResult< boolean, Error > );
		jest.mocked( useUpdateUnfilteredFilesUpload ).mockReturnValue( {
			mutateAsync: jest.fn().mockResolvedValue( { data: { success: true } } ),
			isPending: false,
		} as never );
		jest.mocked( useCurrentUserCapabilities ).mockReturnValue( {
			canUser: jest.fn(),
			capabilities: [],
			isAdmin: true,
		} );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should display svg', () => {
		// Arrange.
		jest.mocked( useWpMediaAttachment ).mockReturnValue( {
			data: {
				id: 1,
				url: 'https://localhost/image.png',
			},
		} as never );

		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );

		const setValue = jest.fn();
		const value = {
			$$type: 'image-src',
			value: {
				id: 1,
			},
		};

		const props = { setValue, value, bind: 'src', propType };

		// Act.
		renderControl( <SvgMediaControl />, props );
		const control = screen.getByRole( 'img' );

		// Assert.
		expect( control ).toHaveAttribute( 'src', 'https://localhost/image.png' );
	} );

	it( 'should display the default svg placeholder when no value is set', () => {
		// Arrange.
		const defaultSvgUrl = 'https://localhost/default-svg.svg';
		const defaultSvg = {
			$$type: 'svg-src',
			value: {
				id: null,
				url: { $$type: 'url', value: defaultSvgUrl },
			},
		};
		const unionPropType = createMockPropType( {
			kind: 'union',
			default: defaultSvg,
			prop_types: {
				'svg-src': createMockPropType( {
					kind: 'object',
					key: 'svg-src',
					default: defaultSvg,
					shape: {
						id: createMockPropType( { kind: 'plain' } ),
						url: createMockPropType( { kind: 'plain' } ),
					},
				} ),
				icon: createMockPropType( { kind: 'object', key: 'icon' } ),
			},
		} );

		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );

		const props = { setValue: jest.fn(), value: null, bind: 'svg', propType: unionPropType };

		// Act.
		renderControl( <SvgMediaControl />, props );

		// Assert.
		expect( screen.getByRole( 'img' ) ).toHaveAttribute( 'src', defaultSvgUrl );
	} );

	it( 'should open media frame in upload mode when upload unfiltered files setting is enabled and clicking on upload', () => {
		// Arrange
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );

		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		// Act
		renderControl( <SvgMediaControl />, props );
		fireEvent.click( screen.getByText( 'Upload' ) );

		// Assert
		expect( open ).toHaveBeenCalledWith( { mode: 'upload' } );
	} );

	it( 'should open media frame in browse mode when upload unfiltered files setting is enabled and clicking on select svg', () => {
		// Arrange
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );

		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		// Act
		renderControl( <SvgMediaControl />, props );
		fireEvent.click( screen.getByText( 'Select SVG' ) );

		// Assert
		expect( open ).toHaveBeenCalledWith( { mode: 'browse' } );
	} );

	it( 'should open media frame in browse mode when upload unfiltered files setting is disabled and clicking on select svg', () => {
		// Arrange
		jest.mocked( useUnfilteredFilesUpload ).mockReturnValue( { data: false } as UseQueryResult< boolean, Error > );
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );

		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		// Act
		renderControl( <SvgMediaControl />, props );
		fireEvent.click( screen.getByText( 'Select SVG' ) );

		// Assert
		expect( open ).toHaveBeenCalledWith( { mode: 'browse' } );
	} );

	it( 'should open unfiltered modal when upload unfiltered files setting is disabled and clicking on upload', () => {
		// Arrange
		jest.mocked( useUnfilteredFilesUpload ).mockReturnValue( { data: false } as UseQueryResult< boolean, Error > );
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );
		jest.mocked( useUpdateUnfilteredFilesUpload ).mockReturnValue( {
			mutateAsync: jest.fn().mockResolvedValue( { data: { success: true } } ),
		} as never );

		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		// Act
		renderControl( <SvgMediaControl />, props );
		fireEvent.click( screen.getByText( 'Upload' ) );

		// Assert
		expect( screen.getByText( 'Enable Unfiltered Uploads' ) ).toBeInTheDocument();
		expect( open ).not.toHaveBeenCalledWith( { mode: 'upload' } );
	} );

	it( 'should open media frame in upload mode when enabling unfiltered files upload and clicking on enable', async () => {
		// Arrange
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );
		jest.mocked( useUnfilteredFilesUpload ).mockReturnValue( { data: false } as UseQueryResult< boolean, Error > );

		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		renderControl( <SvgMediaControl />, props );
		fireEvent.click( screen.getByText( 'Upload' ) );

		// Act
		fireEvent.click( screen.getByText( 'Enable' ) );

		// Assert
		await waitFor( () => expect( open ).toHaveBeenCalledWith( { mode: 'upload' } ) );
	} );

	it( 'should show error modal when enabling unfiltered files upload and clicking on enable, and enable returns success false', async () => {
		// Arrange
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );
		jest.mocked( useUnfilteredFilesUpload ).mockReturnValue( { data: false } as UseQueryResult< boolean, Error > );
		jest.mocked( useUpdateUnfilteredFilesUpload ).mockReturnValue( {
			mutateAsync: jest.fn().mockResolvedValue( { data: { success: false } } ),
			isPending: false,
		} as never );

		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		renderControl( <SvgMediaControl />, props );
		fireEvent.click( screen.getByText( 'Upload' ) );

		// Act
		fireEvent.click( screen.getByText( 'Enable' ) );

		// Assert
		await screen.findByText( /You can try again/, {}, { timeout: 1000 } );
		expect( open ).not.toHaveBeenCalled();
	} );

	it( 'should show error modal when enabling unfiltered files upload and clicking on enable, and enable throws error', async () => {
		// Arrange
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );
		jest.mocked( useUnfilteredFilesUpload ).mockReturnValue( { data: false } as UseQueryResult< boolean, Error > );
		jest.mocked( useUpdateUnfilteredFilesUpload ).mockReturnValue( {
			mutateAsync: jest.fn().mockRejectedValue( new DOMException() ),
			isPending: false,
		} as never );

		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		renderControl( <SvgMediaControl />, props );

		// Act
		fireEvent.click( screen.getByText( 'Upload' ) );
		fireEvent.click( screen.getByText( 'Enable' ) );

		// Assert
		expect( await screen.findByText( /You can try again/, {}, { timeout: 3000 } ) ).toBeInTheDocument();
		expect( open ).not.toHaveBeenCalled();
	} );

	it( 'should not show the icon library when showIconLibrary is not set', () => {
		// Arrange
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );
		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		// Act
		renderControl( <SvgMediaControl />, props );

		// Assert
		expect( screen.queryByText( 'Icon library' ) ).not.toBeInTheDocument();
	} );

	it( 'should open the icon library modal when clicking on icon library', () => {
		// Arrange
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );

		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		// Act
		renderControl( <SvgMediaControl showIconLibrary />, props );
		fireEvent.click( screen.getByText( 'Icon library' ) );

		// Assert
		expect( openIconLibrary ).toHaveBeenCalledTimes( 1 );
		expect( openIconLibrary ).toHaveBeenCalledWith(
			expect.objectContaining( {
				onSelect: expect.any( Function ),
			} )
		);
	} );

	it( 'should persist a font icon when one is selected from the icon library', () => {
		// Arrange
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );
		const setValue = jest.fn();
		const props = { setValue, value: {}, bind: 'svg', propType };

		jest.mocked( openIconLibrary ).mockImplementation( ( { onSelect } = {} ) => {
			onSelect?.( { value: 'fas fa-star', library: 'fa-solid' } );
		} );

		// Act
		renderControl( <SvgMediaControl showIconLibrary />, props );
		fireEvent.click( screen.getByText( 'Icon library' ) );

		// Assert
		expect( setValue ).toHaveBeenCalledWith(
			expect.objectContaining( {
				$$type: 'icon',
				value: {
					value: expect.objectContaining( { $$type: 'string', value: 'fas fa-star' } ),
					library: expect.objectContaining( { $$type: 'string', value: 'fa-solid' } ),
				},
			} )
		);
	} );

	it( 'should persist an uploaded SVG when one is selected from the icon library', () => {
		// Arrange
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );
		const setValue = jest.fn();
		const props = { setValue, value: {}, bind: 'svg', propType };

		jest.mocked( openIconLibrary ).mockImplementation( ( { onSelect } = {} ) => {
			onSelect?.( { value: { id: 42, url: 'https://localhost/icon.svg' }, library: 'svg' } );
		} );

		// Act
		renderControl( <SvgMediaControl showIconLibrary />, props );
		fireEvent.click( screen.getByText( 'Icon library' ) );

		// Assert
		expect( setValue ).toHaveBeenCalledWith(
			expect.objectContaining( {
				$$type: 'svg-src',
				value: {
					id: { $$type: 'image-attachment-id', value: 42 },
					url: expect.objectContaining( { $$type: 'url', value: 'https://localhost/icon.svg' } ),
				},
			} )
		);
	} );

	it( 'should preview a selected font icon in the card', () => {
		// Arrange
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );

		const props = {
			setValue: jest.fn(),
			bind: 'svg',
			propType,
			value: {
				$$type: 'icon',
				value: {
					value: { $$type: 'string', value: 'fas fa-star' },
					library: { $$type: 'string', value: 'fa-solid' },
				},
			},
		};

		// Act
		renderControl( <SvgMediaControl showIconLibrary />, props );

		// Assert
		const preview = screen.getByLabelText( 'Preview icon' );
		expect( preview ).toHaveClass( 'fas', 'fa-star' );
		expect( enqueueIconFonts ).toHaveBeenCalledWith( 'fa-solid' );
	} );

	it( 'should show infotip on hover for user without admin permissions', async () => {
		// Arrange
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );
		jest.mocked( useUnfilteredFilesUpload ).mockReturnValue( { data: false } as UseQueryResult< boolean, Error > );
		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };
		jest.mocked( useCurrentUserCapabilities ).mockReturnValue( {
			canUser: jest.fn(),
			capabilities: [],
			isAdmin: false,
		} );

		// Act
		renderControl( <SvgMediaControl />, props );

		// Assert
		const uploadButton = screen.getByText( 'Upload' );
		fireEvent.mouseEnter( uploadButton );
		expect(
			await screen.findByText( /ask the site administrator to enable unfiltered/, {}, { timeout: 3000 } )
		).toBeInTheDocument();
	} );
} );
