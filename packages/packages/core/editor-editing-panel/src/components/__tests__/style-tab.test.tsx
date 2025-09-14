import * as React from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { render, screen } from '@testing-library/react';

import { useElement } from '../../contexts/element-context';
import { useStyle } from '../../contexts/style-context';
import { useCustomCss } from '../../hooks/use-custom-css';
import { useDefaultPanelSettings } from '../../hooks/use-default-panel-settings';
import { StyleTab } from '../style-tab';
import { StyleTabSection } from '../style-tab-section';

jest.mock( '../../contexts/element-context' );
jest.mock( '../../contexts/style-context' );
jest.mock( '../../hooks/use-custom-css' );
jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../../hooks/use-default-panel-settings' );

describe( 'style-tab', () => {
	beforeAll( () => {
		jest.mocked( isExperimentActive ).mockReturnValue( true );
		jest.mocked( useElement ).mockReturnValue( {
			element: {
				id: 'test-element-id',
				type: 'test-type',
			},
		} as unknown as ReturnType< typeof useElement > );
		jest.mocked( useDefaultPanelSettings ).mockReturnValue( {
			defaultSectionsExpanded: {
				style: [ 'ShouldBeOpen' ],
			},
			defaultTab: 'style',
		} );
		jest.mocked( useCustomCss ).mockReturnValue( {
			customCss: null,
			meta: { breakpoint: null, state: null },
			styleId: "test-style-id",
			setCustomCss: jest.fn(),
		} );
		jest.mocked( useStyle ).mockReturnValue( {
			id: 'test-style-id',
			provider: null,
			meta: { breakpoint: null, state: null },
		} as never );
	} );

	afterAll( () => jest.clearAllMocks() );

	[ 'ShouldBeOpen', 'ShouldBeClosed' ].forEach( ( sectionName ) => {
		const expectedOpen = sectionName === 'ShouldBeOpen';
		it( `Should render a section - ${ sectionName }`, async () => {
			// Arrange
			const dummyContent = () => <div>content-for-{ sectionName }</div>;

			// Act
			render(
				<StyleTabSection section={ { component: dummyContent, name: sectionName, title: sectionName } } />
			);

			const collapsableContent = screen.queryByText( `content-for-${ sectionName }` );

			// Assert
			if ( expectedOpen ) {
				expect( collapsableContent ).toBeInTheDocument();
			} else {
				expect( collapsableContent ).toBeNull();
			}
		} );
	} );

	it( 'Should include 150px bottom spacing', () => {
		const styleTabSource = StyleTab.toString();

		expect( styleTabSource ).toContain( 'Box' );
		expect( styleTabSource ).toContain( '150px' );
		expect( styleTabSource ).toContain( 'height' );
	} );
} );
