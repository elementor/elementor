import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { fireEvent, screen } from '@testing-library/react';

import { useBoundProp } from '../../bound-prop-context';
import { type ControlHeaderProps, injectIntoControlHeader } from '../../components/control-header-location';
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

	it( 'should render a composition of size and media controls', () => {
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

	describe( 'header actions', () => {
		const HeaderAction = ( { elementId, controlType, bind, path }: ControlHeaderProps ) => (
			<button>{ `${ controlType } ${ bind } ${ path.join( '.' ) } ${ elementId ?? 'none' }` }</button>
		);

		const headerProps = { bind: 'image', setValue: jest.fn(), propType, value: null };

		afterEach( () => {
			flushAllInjections();
		} );

		it( 'should render injected header actions with the control header props', () => {
			// Arrange.
			injectIntoControlHeader( { id: 'test-header-action', component: HeaderAction } );

			// Act.
			renderControl( <ImageControl sizes={ sizes } context={ { elementId: 'el-1' } } />, headerProps );

			// Assert.
			expect( screen.getByRole( 'button', { name: 'image image image el-1' } ) ).toBeInTheDocument();
		} );

		it( 'should pass no element id when rendered without an element context', () => {
			// Arrange.
			injectIntoControlHeader( { id: 'test-header-action', component: HeaderAction } );

			// Act.
			renderControl( <ImageControl sizes={ sizes } />, headerProps );

			// Assert.
			expect( screen.getByRole( 'button', { name: 'image image image none' } ) ).toBeInTheDocument();
		} );

		it( 'should render no header actions when nothing is injected', () => {
			// Act.
			renderControl( <ImageControl sizes={ sizes } context={ { elementId: 'el-1' } } />, headerProps );

			// Assert.
			expect( screen.queryByRole( 'button', { name: /el-1/ } ) ).not.toBeInTheDocument();
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
