import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { screen } from '@testing-library/react';

import { initControlHeader } from '../../control-header/init';
import { ImageControl } from '../../controls/image-control';

jest.mock( '../../controls/image-media-control', () => ( {
	ImageMediaControl: () => null,
} ) );

const propType = createMockPropType( {
	kind: 'object',
	key: 'image',
	shape: {
		src: createMockPropType( { kind: 'union' } ),
		size: createMockPropType( { kind: 'plain' } ),
	},
} );

const headerProps = { bind: 'image', setValue: jest.fn(), propType, value: null };

describe( 'ControlHeaderAppPromotion', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render promotion content via the control header slot', () => {
		// Arrange.
		initControlHeader();
		const promotion = {
			content: 'Show promotion copy in the header.',
			label: 'Promote',
		};

		// Act.
		renderControl( <ImageControl sizes={ [] } promotion={ promotion } />, headerProps );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Promote' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing in the header slot without promotion data', () => {
		// Arrange.
		initControlHeader();

		// Act.
		renderControl( <ImageControl sizes={ [] } context={ { elementId: 'el-1' } } />, headerProps );

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'Optimize' } ) ).not.toBeInTheDocument();
	} );
} );
