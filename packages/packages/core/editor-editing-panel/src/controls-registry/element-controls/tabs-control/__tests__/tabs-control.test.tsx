import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { useElementChildren, useElementEditorSettings } from '@elementor/editor-elements';
import { type PropType } from '@elementor/editor-props';
import { screen } from '@testing-library/react';

import { mockElement } from '../../../../__tests__/utils';
import { useElement } from '../../../../contexts/element-context';
import { TabsControlContent } from '../tabs-control';

jest.mock( '@elementor/editor-controls', () => {
	const actual = jest.requireActual( '@elementor/editor-controls' );

	return {
		...actual,
		useBoundProp: jest.fn(),
	};
} );
jest.mock( '@elementor/editor-elements' );
jest.mock( '../../../../contexts/element-context' );

describe( '<TabsControlContent />', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( useElement ).mockReturnValue( {
			element: mockElement( { id: 'tabs-1', type: 'e-tabs' } ),
			elementType: createMockElementType(),
			settings: {},
		} );

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: 0,
			setValue: jest.fn(),
			bind: 'default-active-tab',
			propType: {} as PropType,
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		jest.mocked( useElementEditorSettings ).mockImplementation( ( elementId: string ) => {
			const match = String( elementId ).match( /^item-(\d+)$/ );
			if ( ! match ) {
				return {};
			}
			return { title: `Tab #${ Number( match[ 1 ] ) + 1 }` };
		} );
	} );

	it( 'should show the live editor title on the repeater row, not the children snapshot', () => {
		jest.mocked( useElementChildren ).mockReturnValue( {
			'e-tab': [ { id: 'item-0', editorSettings: { title: 'Tab #1' } } ],
		} );

		jest.mocked( useElementEditorSettings ).mockImplementation( ( elementId: string ) => {
			if ( elementId === 'item-0' ) {
				return { title: 'Overview' };
			}
			return {};
		} );

		renderWithTheme( <TabsControlContent label="Tabs" /> );

		expect( screen.getByText( 'Overview' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Tab #1' ) ).not.toBeInTheDocument();
	} );
} );
