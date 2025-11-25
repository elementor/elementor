import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { useElement } from '@elementor/editor-editing-panel';
import { type PropValue } from '@elementor/editor-props';
import { ThemeProvider } from '@elementor/ui';
import { render, screen } from '@testing-library/react';

import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { selectOverridableProps, slice } from '../../../store/store';
import { COMPONENT_DOCUMENT_TYPE } from '../../consts';
import { FORBIDDEN_KEYS, OverridablePropIndicator } from '../overridable-prop-indicator';
import { __createStore, __dispatch, __registerSlice, type SliceState, type Store } from '@elementor/store';
import { createMockDocumentData, createMockPropType } from 'test-utils';
import { generateUniqueId } from '@elementor/utils';

jest.mock( '@elementor/editor-controls', () => ( {
    ...jest.requireActual( '@elementor/editor-controls' ),
    useBoundProp: jest.fn(),
} ) );
jest.mock( '@elementor/editor-documents' );
jest.mock( '@elementor/editor-editing-panel', () => ( {
	...jest.requireActual( '@elementor/editor-editing-panel' ),
	useElement: jest.fn(),
} ) );
jest.mock( '../../../store/store', () => ( {
	...jest.requireActual( '../../../store/store' ),
	selectOverridableProps: jest.fn(),
} ) );

const MOCK_ELEMENT_ID = 'test-element-123';
const MOCK_COMPONENT_ID = 456;
const MOCK_WIDGET_TYPE = 'e-heading';

describe( 'OverridablePropIndicator', () => {
    let store: Store< SliceState< typeof slice > >;
    
	beforeEach( () => {
        __registerSlice( slice );
		store = __createStore();

		jest.mocked( useElement ).mockReturnValue( {
			element: { id: MOCK_ELEMENT_ID, type: MOCK_WIDGET_TYPE },
			elementType: { key: MOCK_WIDGET_TYPE, propsSchema: {}, controls: [], title: 'Test Element' },
		} );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

    it.each( [
        {
            should: 'not show indicator on fields when not editing a component',
            bind: 'title',
            isOverridable: false,
            isComponent: false
        }, {
            should: 'be a plus icon if prop is not overridable',
            bind: 'title',
            isOverridable: false,
            isComponent: true,
        }, {
            should: 'be a check icon if prop is overridable',
            bind: 'title',
            isOverridable: true,
            isComponent: true,
        }, {
            should: 'not show indicator on fields bound to forbidden keys',
            bind: '_cssid',
            isOverridable: true,
            isComponent: true,
        }
    ] )( 'should $should', ( { bind, isOverridable, isComponent } ) => {
        // Arrange
		const mockDocument = createMockDocumentData( {
			id: MOCK_COMPONENT_ID,
            type: isComponent ? COMPONENT_DOCUMENT_TYPE : 'wp-page',
		} );

		jest.mocked( getV1CurrentDocument ).mockReturnValue( mockDocument );
		jest.mocked( useBoundProp ).mockReturnValue( mockPropType( {
			bind,
			value: { $$type: 'string', value: 'Test' },
		}, isOverridable ) );
		jest.mocked( selectOverridableProps ).mockReturnValue( {
			props: {},
			groups: {
				items: {},
				order: [],
			},
		} );

		// Act
		renderFieldWithIndicator();

		// Assert
        if ( ! isComponent ) {
            expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

            return;
        }

        if ( FORBIDDEN_KEYS.includes( bind ) ) {
            expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

            return;
        }

        const indicator = screen.getByLabelText( isOverridable ? 'Overridable property' : 'Make prop overridable' );
        expect( indicator ).toBeInTheDocument();

        const icon = indicator.querySelector( 'svg' );
        expect( icon ).toBeInTheDocument();
    } );
} );

function mockPropType( { bind, value }: { bind: string, value: PropValue }, isOverridableType: boolean ): ReturnType< typeof useBoundProp > {
    const params = {
        value,
        setValue: jest.fn(),
        restoreValue: jest.fn(),
        resetValue: jest.fn(),
        bind,
        propType: createMockPropType( { kind: 'plain' } ),
        path: [ bind ],
    }

    if ( ! isOverridableType ) {
        return params;
    }

    const overridablePropValue = componentOverridablePropTypeUtil.create( { override_key: generateUniqueId(), default_value: value } );

    return {
        ...params,
        value: overridablePropValue,
    }
}

function renderFieldWithIndicator() {
	return render(
		<ThemeProvider>
			<OverridablePropIndicator />
		</ThemeProvider>
	);
}