import { renderHookWithStore } from 'test-utils';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';

import { slice } from '../../store/store';
import { type OverridableProps, type PublishedComponent } from '../../types';
import { filterValidOverridableProps } from '../../utils/filter-valid-overridable-props';
import { useSanitizeOverridableProps } from '../use-sanitize-overridable-props';

jest.mock( '../../utils/filter-valid-overridable-props', () => ( {
	filterValidOverridableProps: jest.fn(),
} ) );

const mockFilterValidOverridableProps = jest.mocked( filterValidOverridableProps );

const MOCK_COMPONENT_ID = 123;
const MOCK_SECOND_COMPONENT_ID = 456;

function createMockOverridableProps(): OverridableProps {
	return {
		props: {
			'prop-1': {
				overrideKey: 'prop-1',
				label: 'Title',
				elementId: 'element-1',
				propKey: 'title',
				widgetType: 'e-heading',
				elType: 'widget',
				groupId: 'content',
				originValue: { $$type: 'string', value: 'Hello' },
			},
		},
		groups: {
			items: {
				content: { id: 'content', label: 'Content', props: [ 'prop-1' ] },
			},
			order: [ 'content' ],
		},
	};
}

function createMockComponent( id: number, overridableProps?: OverridableProps ): PublishedComponent {
	return {
		id,
		uid: `component-uid-${ id }`,
		name: `Component ${ id }`,
		overridableProps,
	};
}

describe( 'useSanitizeOverridableProps', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		store = __createStore();
		dispatch( slice.actions.resetSanitizedComponents() );
	} );

	describe( 'filtering', () => {
		it( 'should filter overridable props when component is not sanitized', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent ] ) );
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			const { result } = renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledWith( mockOverridableProps, undefined );
			expect( result.current ).toBe( mockOverridableProps );
		} );

		it( 'should pass instanceElementId to filter function', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent ] ) );
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID, 'instance-element-1' ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledWith(
				mockOverridableProps,
				'instance-element-1'
			);
		} );

		it( 'should filter on every render when not sanitized', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent ] ) );
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should filter independently per component', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent1 = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			const mockComponent2 = createMockComponent( MOCK_SECOND_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent1, mockComponent2 ] ) );
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( 'caching via isSanitized', () => {
		it( 'should skip filtering when component is marked as sanitized', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent ] ) );
			dispatch(
				slice.actions.updateComponentSanitizedAttribute( {
					componentId: MOCK_COMPONENT_ID,
					attribute: 'overridableProps',
				} )
			);

			// Act
			const { result } = renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();
			expect( result.current ).toBe( mockOverridableProps );
		} );

		it( 'should track sanitized state per component', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent1 = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			const mockComponent2 = createMockComponent( MOCK_SECOND_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent1, mockComponent2 ] ) );
			dispatch(
				slice.actions.updateComponentSanitizedAttribute( {
					componentId: MOCK_COMPONENT_ID,
					attribute: 'overridableProps',
				} )
			);
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );

			// Assert - component 1 is sanitized, should skip filtering
			expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();

			// Act - component 2 is NOT sanitized, should filter
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should re-run filtering after sanitized state is reset', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent ] ) );
			dispatch(
				slice.actions.updateComponentSanitizedAttribute( {
					componentId: MOCK_COMPONENT_ID,
					attribute: 'overridableProps',
				} )
			);
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			const { unmount } = renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();

			// Act
			unmount();
			dispatch( slice.actions.resetSanitizedComponents() );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should return undefined when componentId is null', () => {
			// Act
			const { result } = renderHookWithStore( () => useSanitizeOverridableProps( null ), store );

			// Assert
			expect( result.current ).toBeUndefined();
			expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();
		} );

		it( 'should return undefined when component does not exist', () => {
			// Act
			const { result } = renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );

			// Assert
			expect( result.current ).toBeUndefined();
			expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();
		} );
	} );
} );
