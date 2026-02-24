import { renderHookWithStore } from 'test-utils';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';

import { slice } from '../../../store/store';
import { type OverridableProps, type PublishedComponent } from '../../../types';
import { filterValidOverridableProps } from '../../../utils/filter-valid-overridable-props';
import { deleteOverridableProp } from '../../store/actions/delete-overridable-prop';
import { updateComponentSanitizedAttribute } from '../../store/actions/update-component-sanitized-attribute';
import { SanitizeOverridableProps } from '../sanitize-overridable-props';

jest.mock( '../../../utils/filter-valid-overridable-props', () => ( {
	filterValidOverridableProps: jest.fn(),
} ) );

jest.mock( '../../store/actions/delete-overridable-prop', () => ( {
	deleteOverridableProp: jest.fn(),
} ) );

jest.mock( '../../store/actions/update-component-sanitized-attribute', () => ( {
	updateComponentSanitizedAttribute: jest.fn(),
} ) );

const mockFilterValidOverridableProps = jest.mocked( filterValidOverridableProps );
const mockDeleteOverridableProp = jest.mocked( deleteOverridableProp );
const mockUpdateComponentSanitizedAttribute = jest.mocked( updateComponentSanitizedAttribute );

const MOCK_COMPONENT_ID = 123;

function createMockOverridableProps( propKeys: string[] = [ 'prop-1' ] ): OverridableProps {
	const props: OverridableProps[ 'props' ] = {};

	for ( const key of propKeys ) {
		props[ key ] = {
			overrideKey: key,
			label: `Label ${ key }`,
			elementId: `element-${ key }`,
			propKey: 'text',
			widgetType: 'e-heading',
			elType: 'widget',
			groupId: 'content',
			originValue: { $$type: 'string', value: 'Hello' },
		};
	}

	return {
		props,
		groups: {
			items: {
				content: { id: 'content', label: 'Content', props: propKeys },
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

function useSanitizeOverridablePropsEffect() {
	return SanitizeOverridableProps();
}

describe( 'SanitizeOverridableProps', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		store = __createStore();
	} );

	it( 'should not run cleanup when no current component', () => {
		// Act
		renderHookWithStore( useSanitizeOverridablePropsEffect, store );

		// Assert
		expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();
		expect( mockDeleteOverridableProp ).not.toHaveBeenCalled();
		expect( mockUpdateComponentSanitizedAttribute ).not.toHaveBeenCalled();
	} );

	it( 'should not run cleanup when component is already sanitized', () => {
		// Arrange
		const mockOverridableProps = createMockOverridableProps();
		const mockComponent = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
		dispatch( slice.actions.load( [ mockComponent ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
		dispatch(
			slice.actions.updateComponentSanitizedAttribute( {
				componentId: MOCK_COMPONENT_ID,
				attribute: 'overridableProps',
			} )
		);

		// Act
		renderHookWithStore( useSanitizeOverridablePropsEffect, store );

		// Assert
		expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();
		expect( mockDeleteOverridableProp ).not.toHaveBeenCalled();
	} );

	it( 'should run cleanup and mark as sanitized when component is not sanitized', () => {
		// Arrange
		const mockOverridableProps = createMockOverridableProps();
		const mockComponent = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
		dispatch( slice.actions.load( [ mockComponent ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
		mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

		// Act
		renderHookWithStore( useSanitizeOverridablePropsEffect, store );

		// Assert
		expect( mockFilterValidOverridableProps ).toHaveBeenCalledWith( mockOverridableProps );
		expect( mockDeleteOverridableProp ).not.toHaveBeenCalled();
		expect( mockUpdateComponentSanitizedAttribute ).toHaveBeenCalledWith( MOCK_COMPONENT_ID, 'overridableProps' );
	} );

	it( 'should delete stale props that are not in the filtered result', () => {
		// Arrange
		const mockOverridableProps = createMockOverridableProps( [ 'prop-1', 'prop-2', 'prop-3' ] );
		const filteredProps = createMockOverridableProps( [ 'prop-1' ] );
		const mockComponent = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
		dispatch( slice.actions.load( [ mockComponent ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
		mockFilterValidOverridableProps.mockReturnValue( filteredProps );

		// Act
		renderHookWithStore( useSanitizeOverridablePropsEffect, store );

		// Assert
		expect( mockDeleteOverridableProp ).toHaveBeenCalledWith( {
			componentId: MOCK_COMPONENT_ID,
			propKey: 'prop-2',
			source: 'system',
		} );
		expect( mockDeleteOverridableProp ).toHaveBeenCalledWith( {
			componentId: MOCK_COMPONENT_ID,
			propKey: 'prop-3',
			source: 'system',
		} );
		expect( mockDeleteOverridableProp ).toHaveBeenCalledTimes( 2 );
		expect( mockUpdateComponentSanitizedAttribute ).toHaveBeenCalledWith( MOCK_COMPONENT_ID, 'overridableProps' );
	} );

	it( 'should re-run cleanup after sanitized state is reset', () => {
		// Arrange
		const mockOverridableProps = createMockOverridableProps();
		const mockComponent = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
		dispatch( slice.actions.load( [ mockComponent ] ) );
		dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
		dispatch(
			slice.actions.updateComponentSanitizedAttribute( {
				componentId: MOCK_COMPONENT_ID,
				attribute: 'overridableProps',
			} )
		);
		mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

		// Act
		const { rerender } = renderHookWithStore( useSanitizeOverridablePropsEffect, store );
		expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();

		// Act
		dispatch( slice.actions.resetSanitizedComponents() );
		rerender();

		// Assert
		expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 1 );
		expect( mockUpdateComponentSanitizedAttribute ).toHaveBeenCalledWith( MOCK_COMPONENT_ID, 'overridableProps' );
	} );
} );
