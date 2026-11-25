import { createMockStylesProvider, mockHistoryManager } from 'test-utils';
import { createElementStyle, deleteElementStyle, getElementLabel } from '@elementor/editor-elements';

import { getElementLocalStyle } from '../element-local-style';
import { createUndoableUpdateStyles, type StyleTarget } from '../styles-history';

jest.mock( '../element-local-style' );
jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	deleteElementStyle: jest.fn(),
	getElementLabel: jest.fn(),
	createElementStyle: jest.fn(),
} ) );

const CREATED_STYLE_ID = 'created-local-style';
const DESKTOP = { breakpoint: 'desktop', state: null } as const;
const MOBILE = { breakpoint: 'mobile', state: null } as const;

describe( 'createUndoableUpdateStyles', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		historyMock.beforeEach();
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	it( 'should create one local style for several breakpoints of one element, and undo and redo them in one step', () => {
		// Arrange.
		const localProvider = createMockStylesProvider( { key: 'document-elements-1' }, [
			{
				id: CREATED_STYLE_ID,
				type: 'class',
				label: 'local',
				variants: [ { meta: DESKTOP, props: { color: 'red' }, custom_css: null } ],
			},
		] );
		const target: StyleTarget = { elementId: 'part-a', classesProp: 'classes', styleId: null, provider: null };

		jest.mocked( createElementStyle ).mockReturnValue( CREATED_STYLE_ID );
		jest.mocked( getElementLocalStyle ).mockReturnValue( { styleId: CREATED_STYLE_ID, provider: localProvider } );
		jest.mocked( getElementLabel ).mockReturnValue( 'Part A' );

		const undoableUpdateStyles = createUndoableUpdateStyles();

		// Act.
		undoableUpdateStyles( {
			writes: [
				{ target, meta: DESKTOP, props: { color: 'red' } },
				{ target, meta: MOBILE, props: { color: 'blue' } },
			],
			propDisplayName: 'Button style',
		} );

		// Assert.
		expect( createElementStyle ).toHaveBeenCalledTimes( 1 );
		expect( createElementStyle ).toHaveBeenCalledWith( expect.objectContaining( { meta: DESKTOP } ) );
		expect( localProvider.actions.updateProps ).toHaveBeenCalledWith(
			{ id: CREATED_STYLE_ID, meta: MOBILE, props: { color: 'blue' } },
			{ elementId: 'part-a' }
		);
		expect( historyMock.instance.get()?.title ).toBe( 'Part A' );
		expect( historyMock.instance.get()?.subTitle ).toBe( 'Button style edited' );

		// Act.
		historyMock.instance.undo();

		// Assert.
		expect( localProvider.actions.updateProps ).toHaveBeenLastCalledWith(
			{ id: CREATED_STYLE_ID, meta: MOBILE, props: {}, mode: 'replace' },
			{ elementId: 'part-a' }
		);
		expect( deleteElementStyle ).toHaveBeenCalledWith( 'part-a', CREATED_STYLE_ID );
		expect( ( localProvider.actions.updateProps as jest.Mock ).mock.invocationCallOrder.at( -1 ) ).toBeLessThan(
			jest.mocked( deleteElementStyle ).mock.invocationCallOrder[ 0 ]
		);

		// Act.
		historyMock.instance.redo();

		// Assert.
		expect( createElementStyle ).toHaveBeenLastCalledWith(
			expect.objectContaining( { meta: DESKTOP, styleId: CREATED_STYLE_ID } )
		);
		expect( localProvider.actions.updateProps ).toHaveBeenLastCalledWith(
			{ id: CREATED_STYLE_ID, meta: MOBILE, props: { color: 'blue' } },
			{ elementId: 'part-a' }
		);
	} );
} );
