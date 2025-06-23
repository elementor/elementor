import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { useBoundProp } from '../../bound-prop-context';
import { ImageControl } from '../image-control';
import { ImageMediaControl } from '../image-media-control';

jest.mock( '../image-media-control' );

const propType = createMockPropType( {
	kind: 'object',
	key: 'image',
	shape: {
		src: createMockPropType( { kind: 'union' } ),
		size: createMockPropType( { kind: 'plain' } ),
	},
} );

describe( 'ImageControl', () => {
	beforeEach( () => {
		jest.mocked( ImageMediaControl ).mockImplementation( MockImageMediaControl );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should render a composition of size and media controls', () => {
		// Arrange.
		const sizes = [
			{ label: 'Small', value: 'small' },
			{ label: 'Medium', value: 'medium' },
		];

		const props = {
			bind: 'image',
			setValue: jest.fn(),
			propType,
			value: {
				$$type: 'image',
				value: {
					size: 'medium',
					src: {
						$$type: 'image-src',
						value: { id: 1, url: null },
					},
				},
			},
		};

		// Act.
		renderControl( <ImageControl sizes={ sizes } />, props );

		fireEvent.mouseDown( screen.getByRole( 'combobox' ) );

		// Assert.
		expect( screen.getByText( 'Small' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Medium' ) ).toBeInTheDocument();
	} );

	it( 'should update the image src', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = {
			bind: 'image',
			setValue,
			propType,
			value: {
				$$type: 'image',
				value: {
					size: 'medium',
					src: {
						$$type: 'image-src',
						value: { id: 1, url: null },
					},
				},
			},
		};

		// Act.
		renderControl( <ImageControl sizes={ [] } />, props );

		fireEvent.click( screen.getByRole( 'button', { name: 'src' } ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'image',
			value: {
				size: 'medium',
				src: {
					$$type: 'src',
					value: 'new-src-from-image-media-control',
				},
			},
		} );
	} );

	it( 'should update the image size', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = {
			bind: 'image',
			setValue,
			propType,
			value: {
				$$type: 'image',
				value: {
					size: 'medium',
					src: {
						$$type: 'image-src',
						value: { id: 1, url: null },
					},
				},
			},
		};

		renderControl( <ImageControl sizes={ [ { label: 'Small', value: 'small' } ] } />, props );

		// Act.
		fireEvent.mouseDown( screen.getByRole( 'combobox' ) );
		fireEvent.click( screen.getByText( 'Small' ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'image',
			value: {
				size: {
					$$type: 'string',
					value: 'small',
				},
				src: {
					$$type: 'image-src',
					value: { id: 1, url: null },
				},
			},
		} );
	} );
} );

const MockImageMediaControl = () => {
	const { setValue, bind } = useBoundProp();

	return (
		<div>
			<button onClick={ () => setValue( { $$type: 'src', value: 'new-src-from-image-media-control' } ) }>
				{ bind }
			</button>
		</div>
	);
};
