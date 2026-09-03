import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';
import { type UseQueryResult } from '@elementor/query';
import { useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { useUnfilteredFilesUpload, useUpdateUnfilteredFilesUpload } from '../../hooks/use-unfiltered-files-upload';
import { IconLibraryPopover } from '../icon-library/icon-library-popover';
import { useFontAwesome7Catalog } from '../icon-library/use-font-awesome-7-catalog';
import { SvgMediaControl } from '../svg-media-control';
import { SVG_MEDIA_ACTION_GROUP_TEST_ID, SVG_MEDIA_CONTROL_CONTAINER_TEST_ID } from '../svg-media-overlay';

const SVG_CONTROL_LEFT = 72;
const SVG_CONTROL_WIDTH = 268;
const SVG_CONTROL_TOP = 40;
const SVG_CONTROL_HEIGHT = 140;
const MEDIA_ACTION_GROUP_TOP = 156;
const MEDIA_ACTION_GROUP_WIDTH = 192;
const MEDIA_ACTION_GROUP_HEIGHT = 28;

jest.mock( '../../hooks/use-unfiltered-files-upload' );
jest.mock( '../icon-library/icon-library-popover', () => ( {
	ICON_LIBRARY_POPOVER_WIDTH: 300,
	IconLibraryPopover: jest.fn( ( { onSelect } ) => (
		<button type="button" onClick={ () => onSelect( { value: 'fa-solid fa-star', library: 'fa-solid' } ) }>
			Pick star
		</button>
	) ),
} ) );
jest.mock( '../icon-library/use-font-awesome-7-catalog', () => ( {
	useFontAwesome7Catalog: jest.fn( () => ( { data: [], isLoading: false } ) ),
} ) );
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
		jest.restoreAllMocks();
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
		fireEvent.click( screen.getByRole( 'button', { name: 'Upload' } ) );

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
		fireEvent.click( screen.getByRole( 'button', { name: 'Select' } ) );

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
		fireEvent.click( screen.getByRole( 'button', { name: 'Select' } ) );

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
		fireEvent.click( screen.getByRole( 'button', { name: 'Upload' } ) );

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
		fireEvent.click( screen.getByRole( 'button', { name: 'Upload' } ) );

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
		fireEvent.click( screen.getByRole( 'button', { name: 'Upload' } ) );

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
		fireEvent.click( screen.getByRole( 'button', { name: 'Upload' } ) );
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
		expect( screen.queryByRole( 'button', { name: 'Icon library' } ) ).not.toBeInTheDocument();
	} );

	it( 'should open the icon library popover when clicking on icon library', () => {
		// Arrange
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );
		mockSvgControlLayout();

		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		// Act
		renderControl( <SvgMediaControl showIconLibrary />, props );
		fireEvent.click( screen.getByRole( 'button', { name: 'Icon library' } ) );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Pick star' } ) ).toBeInTheDocument();
	} );

	it( 'should open the icon library at the control start and width', () => {
		// Arrange
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );
		mockSvgControlLayout();

		const props = { setValue: jest.fn(), value: {}, bind: 'svg', propType };

		// Act
		renderControl( <SvgMediaControl showIconLibrary />, props );
		fireEvent.click( screen.getByRole( 'button', { name: 'Icon library' } ) );

		// Assert
		expect( jest.mocked( IconLibraryPopover ).mock.calls[ 0 ][ 0 ] ).toEqual(
			expect.objectContaining( { width: SVG_CONTROL_WIDTH } )
		);
	} );

	it( 'should persist a font icon when one is selected from the icon library', () => {
		// Arrange
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );
		mockSvgControlLayout();
		const setValue = jest.fn();
		const props = { setValue, value: {}, bind: 'svg', propType };

		// Act
		renderControl( <SvgMediaControl showIconLibrary />, props );
		fireEvent.click( screen.getByRole( 'button', { name: 'Icon library' } ) );
		fireEvent.click( screen.getByRole( 'button', { name: 'Pick star' } ) );

		// Assert
		expect( setValue ).toHaveBeenCalledWith(
			expect.objectContaining( {
				$$type: 'icon',
				value: {
					value: expect.objectContaining( { $$type: 'string', value: 'fa-solid fa-star' } ),
					library: expect.objectContaining( { $$type: 'string', value: 'fa-solid' } ),
				},
			} )
		);
		expect( screen.queryByRole( 'button', { name: 'Pick star' } ) ).not.toBeInTheDocument();
	} );

	it( 'should preview a selected font icon in the card', () => {
		// Arrange
		const starPath = 'M0 0h100v100H0z';
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );
		jest.mocked( useFontAwesome7Catalog ).mockReturnValue( {
			data: [
				{
					id: 'fa-solid:star',
					name: 'star',
					label: 'star',
					library: 'fa-solid',
					value: 'fa-solid fa-star',
					aliases: [],
					width: 576,
					height: 512,
					paths: [ starPath ],
				},
			],
			isLoading: false,
		} as never );

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
		expect( preview ).toHaveAttribute( 'fill', '#000000' );
		expect( preview ).toContainHTML( `d="${ starPath }"` );
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
		const uploadButton = screen.getByRole( 'button', { name: 'Upload' } );
		fireEvent.mouseEnter( uploadButton );
		expect(
			await screen.findByText( /ask the site administrator to enable unfiltered/, {}, { timeout: 3000 } )
		).toBeInTheDocument();
	} );
} );

function mockSvgControlLayout() {
	jest.spyOn( HTMLElement.prototype, 'getBoundingClientRect' ).mockImplementation( function () {
		const testId = this.getAttribute( 'data-testid' );

		if ( testId === SVG_MEDIA_CONTROL_CONTAINER_TEST_ID ) {
			return {
				x: SVG_CONTROL_LEFT,
				y: SVG_CONTROL_TOP,
				top: SVG_CONTROL_TOP,
				left: SVG_CONTROL_LEFT,
				right: SVG_CONTROL_LEFT + SVG_CONTROL_WIDTH,
				bottom: SVG_CONTROL_TOP + SVG_CONTROL_HEIGHT,
				width: SVG_CONTROL_WIDTH,
				height: SVG_CONTROL_HEIGHT,
				toJSON: () => ( {} ),
			};
		}

		if ( testId === SVG_MEDIA_ACTION_GROUP_TEST_ID ) {
			return {
				x: SVG_CONTROL_LEFT,
				y: MEDIA_ACTION_GROUP_TOP,
				top: MEDIA_ACTION_GROUP_TOP,
				left: SVG_CONTROL_LEFT,
				right: SVG_CONTROL_LEFT + MEDIA_ACTION_GROUP_WIDTH,
				bottom: MEDIA_ACTION_GROUP_TOP + MEDIA_ACTION_GROUP_HEIGHT,
				width: MEDIA_ACTION_GROUP_WIDTH,
				height: MEDIA_ACTION_GROUP_HEIGHT,
				toJSON: () => ( {} ),
			};
		}

		return {
			x: 0,
			y: 0,
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			width: 0,
			height: 0,
			toJSON: () => ( {} ),
		};
	} );
}
