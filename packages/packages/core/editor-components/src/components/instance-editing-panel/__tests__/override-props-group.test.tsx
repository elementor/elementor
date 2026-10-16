import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { ElementProvider } from '@elementor/editor-editing-panel';
import { screen } from '@testing-library/react';

import { type OverridablePropsGroup } from '../../../types';
import { OverridePropControl } from '../override-prop-control';
import { OverridePropsGroup } from '../override-props-group';
import { OVERRIDE_PROPS_GROUP_CONTENT_CLASS } from '../override-props-group-constants';

jest.mock( '../override-prop-control', () => ( {
	OverridePropControl: jest.fn(),
} ) );

const MOCK_ELEMENT = {
	id: 'instance-1',
	type: 'component-instance',
};

const MOCK_ELEMENT_TYPE = {
	key: 'component-instance',
	title: 'Component Instance',
	controls: [],
	propsSchema: {},
	dependenciesPerTargetMapping: {},
	styleStates: [],
};

const MOCK_GROUP: OverridablePropsGroup = {
	id: 'content',
	label: 'Carousel',
	props: [ 'prop-1', 'prop-2' ],
};

const CONTENT_CLASS = `.${ OVERRIDE_PROPS_GROUP_CONTENT_CLASS }`;

describe( '<OverridePropsGroup />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders the content element empty when every OverridePropControl renders null (all props hidden)', () => {
		// Arrange
		jest.mocked( OverridePropControl ).mockReturnValue( null );

		// Act
		renderWithTheme(
			<ElementProvider element={ MOCK_ELEMENT } elementType={ MOCK_ELEMENT_TYPE } settings={ {} }>
				<OverridePropsGroup group={ MOCK_GROUP } />
			</ElementProvider>
		);

		// Assert
		// eslint-disable-next-line testing-library/no-node-access -- asserting the CSS contract (a stable class on the content element) that the ":has(.class:empty)" hiding rule relies on; jsdom doesn't evaluate :has, so this is the only way to assert it.
		const content = document.querySelector( CONTENT_CLASS );
		expect( content ).not.toBeNull();
		expect( content ).toBeEmptyDOMElement();
	} );

	it( 'renders the content element non-empty when at least one OverridePropControl renders content', () => {
		// Arrange
		jest.mocked( OverridePropControl ).mockImplementation( ( { overrideKey } ) =>
			overrideKey === 'prop-1' ? null : <div>Visible prop</div>
		);

		// Act
		renderWithTheme(
			<ElementProvider element={ MOCK_ELEMENT } elementType={ MOCK_ELEMENT_TYPE } settings={ {} }>
				<OverridePropsGroup group={ MOCK_GROUP } />
			</ElementProvider>
		);

		// Assert
		// eslint-disable-next-line testing-library/no-node-access -- asserting the CSS contract (a stable class on the content element) that the ":has(.class:empty)" hiding rule relies on; jsdom doesn't evaluate :has, so this is the only way to assert it.
		const content = document.querySelector( CONTENT_CLASS );
		expect( content ).not.toBeNull();
		expect( content ).not.toBeEmptyDOMElement();
		expect( screen.getByText( 'Visible prop' ) ).toBeInTheDocument();
	} );
} );
