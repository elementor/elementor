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

const sizes = [
	{ label: 'Small', value: 'small' },
	{ label: 'Medium', value: 'medium' },
];

describe( 'ImageControl', () => {
	beforeEach( () => {
		jest.mocked( ImageMediaControl ).mockImplementation( MockImageMediaControl );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should render a composition of size and media controls when showMode is all (default)', () => {
		// Arrange.
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

	it( 'should render only media control when showMode is media', () => {
		// Arrange.
		const props = {
			bind: 'image',
			setValue: jest.fn(),
			propType,
		};

		renderControl( <ImageControl sizes={ sizes } showMode="media" />, props );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'src' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'combobox' ) ).not.toBeInTheDocument();
	} );

	it( 'should render only size control when showMode is sizes', () => {
		// Arrange.
		const props = {
			bind: 'image',
			setValue: jest.fn(),
			propType,
		};

		renderControl( <ImageControl sizes={ sizes } showMode="sizes" />, props );

		fireEvent.mouseDown( screen.getByRole( 'combobox' ) );

		// Assert.
		expect( screen.getByText( 'Small' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Medium' ) ).toBeInTheDocument();

		expect( screen.queryByRole( 'button', { name: 'src' } ) ).not.toBeInTheDocument();
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
