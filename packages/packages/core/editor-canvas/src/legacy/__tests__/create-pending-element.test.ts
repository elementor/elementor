import { addModelToParent, findModelInDocument } from '@elementor/editor-elements';
import { createMockElement } from 'test-utils';

import { createPendingElement } from '../create-pending-element';
import { type ElementView } from '../types';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	addModelToParent: jest.fn(),
	findModelInDocument: jest.fn(),
	getContainer: jest.fn(),
} ) );

const mockAddModelToParent = jest.mocked( addModelToParent );
const mockFindModelInDocument = jest.mocked( findModelInDocument );

describe( 'createPendingElement', () => {
	beforeEach( () => {
		( window as typeof window & {
			elementorCommon?: { helpers?: { getUniqueId?: jest.Mock } };
		} ).elementorCommon = {
			helpers: {
				getUniqueId: jest
					.fn()
					.mockReturnValueOnce( 'cloned-parent-id' )
					.mockReturnValueOnce( 'cloned-child-id' ),
			},
		};

		mockAddModelToParent.mockClear();
		mockFindModelInDocument.mockClear();
		mockAddModelToParent.mockReturnValue( true );
		mockFindModelInDocument.mockReturnValue( createMockElement( {} ).model );
	} );

	afterEach( () => {
		delete ( window as typeof window & { elementorCommon?: unknown } ).elementorCommon;
	} );

	it( 'regenerates ids before pending clone insertion', () => {
		// Arrange.
		const wrapperView = {
			getContainer: () => ( { id: 'parent-id' } ),
			once: jest.fn(),
			model: {
				trigger: jest.fn(),
			},
		} as unknown as ElementView;

		const source = {
			id: 'original-parent-id',
			elType: 'container',
			settings: { _element_id: 'original-parent-element-id' },
			elements: [
				{
					id: 'original-child-id',
					elType: 'widget',
					widgetType: 'button',
					settings: { _element_id: 'original-child-element-id' },
					elements: [],
				},
			],
		};

		// Act.
		const pendingElement = createPendingElement( wrapperView, source, { clone: true } );

		// Assert.
		expect( pendingElement?.getContainer().id ).toBe( 'cloned-parent-id' );
		expect( mockAddModelToParent ).toHaveBeenCalledWith(
			'parent-id',
			expect.objectContaining( {
				id: 'cloned-parent-id',
				settings: expect.objectContaining( { _element_id: '' } ),
				elements: [
					expect.objectContaining( {
						id: 'cloned-child-id',
						settings: expect.objectContaining( { _element_id: '' } ),
					} ),
				],
			} ),
			expect.objectContaining( {
				clone: false,
			} ),
		);
		expect( mockFindModelInDocument ).toHaveBeenCalledWith( 'cloned-parent-id' );
	} );

	it( 'preserves the source id when clone is false', () => {
		// Arrange.
		const wrapperView = {
			getContainer: () => ( { id: 'parent-id' } ),
			once: jest.fn(),
			model: {
				trigger: jest.fn(),
			},
		} as unknown as ElementView;

		const source = {
			id: 'original-parent-id',
			elType: 'widget',
			widgetType: 'button',
			settings: { _element_id: 'original-parent-element-id' },
			elements: [],
		};

		// Act.
		const pendingElement = createPendingElement( wrapperView, source, { clone: false } );

		// Assert.
		expect( pendingElement?.getContainer().id ).toBe( 'original-parent-id' );
		expect( mockAddModelToParent ).toHaveBeenCalledWith(
			'parent-id',
			expect.objectContaining( {
				id: 'original-parent-id',
				settings: expect.objectContaining( {
					_element_id: 'original-parent-element-id',
				} ),
			} ),
			expect.objectContaining( {
				clone: false,
			} ),
		);
		expect( mockFindModelInDocument ).toHaveBeenCalledWith( 'original-parent-id' );
	} );
} );
