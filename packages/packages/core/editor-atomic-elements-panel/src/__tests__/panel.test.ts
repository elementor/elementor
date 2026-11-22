import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import { usePanelActions } from '../panel';

const mockDispatch = jest.fn();

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommand: jest.fn(),
	__privateUseRouteStatus: jest.fn( () => ( { isActive: false, isBlocked: false } ) ),
} ) );
jest.mock( '../components/atomic-elements-panel', () => ( { AtomicElementsPanel: () => null } ) );
jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__useDispatch: () => mockDispatch,
	__useSelector: jest.fn( () => null ),
} ) );

const SELECTED_ELEMENT_ID = 'element-123';
const SELECTED_CONTAINER = { id: SELECTED_ELEMENT_ID };

describe( 'atomic elements panel', () => {
	beforeEach( () => {
		jest.mocked( runCommand ).mockClear();
		mockDispatch.mockClear();

		window.elementor = {
			selection: { getElements: () => [ { model: { get: () => SELECTED_ELEMENT_ID } } ] },
			getContainer: () => SELECTED_CONTAINER,
		} as unknown as typeof window.elementor;
	} );

	it( 'should dispatch on open and on close', async () => {
		// Arrange.
		const { result } = renderHook( () => usePanelActions() );

		// Act.
		await result.current.open();
		await result.current.close();

		// Assert.
		expect( mockDispatch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should restore the canvas selection after close', async () => {
		// Arrange.
		const { result } = renderHook( () => usePanelActions() );

		// Act.
		await result.current.open();
		await result.current.close();

		// Assert.
		expect( runCommand ).toHaveBeenCalledWith( 'document/elements/select', { container: SELECTED_CONTAINER } );
	} );
} );
