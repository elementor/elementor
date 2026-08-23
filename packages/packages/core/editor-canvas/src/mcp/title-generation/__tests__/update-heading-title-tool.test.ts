import { getContainer } from '@elementor/editor-elements';
import { escapedHtmlPropTypeUtil } from '@elementor/editor-props';

import { doUpdateElementProperty } from '../../utils/do-update-element-property';
import { initUpdateHeadingTitleTool } from '../tools/update-heading-title-tool';

jest.mock( '@elementor/editor-elements', () => ( {
	getContainer: jest.fn(),
} ) );

jest.mock( '../../utils/do-update-element-property', () => ( {
	doUpdateElementProperty: jest.fn(),
} ) );

const ELEMENT_ID = 'heading-el-1';
const GENERATED_TITLE = 'Generated heading title';

type Handler = ( args: { elementId: string; title: string } ) => {
	success: boolean;
	elementId: string;
	title: string;
};

const getHandler = (): Handler => {
	const addTool = jest.fn();
	initUpdateHeadingTitleTool( { addTool, setMCPDescription: jest.fn() } as never );
	return addTool.mock.calls[ 0 ][ 0 ].handler;
};

describe( 'update-heading-title tool', () => {
	beforeEach( () => {
		jest.mocked( doUpdateElementProperty ).mockReset();
	} );

	it( 'updates the heading title for a valid e-heading element', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( {
			settings: { get: () => 'e-heading' },
		} as never );
		const handler = getHandler();

		// Act
		const result = handler( { elementId: ELEMENT_ID, title: GENERATED_TITLE } );

		// Assert
		expect( result ).toEqual( {
			success: true,
			elementId: ELEMENT_ID,
			title: GENERATED_TITLE,
		} );
		expect( doUpdateElementProperty ).toHaveBeenCalledWith(
			expect.objectContaining( {
				elementId: ELEMENT_ID,
				elementType: 'e-heading',
				propertyName: 'title',
				propertyValue: escapedHtmlPropTypeUtil.create( GENERATED_TITLE ),
			} )
		);
	} );

	it( 'throws when the element does not exist', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( null );
		const handler = getHandler();

		// Act
		const act = () => handler( { elementId: ELEMENT_ID, title: GENERATED_TITLE } );

		// Assert
		expect( act ).toThrow( `Element with id ${ ELEMENT_ID } not found` );
		expect( doUpdateElementProperty ).not.toHaveBeenCalled();
	} );

	it( 'throws when the element is not an e-heading', () => {
		// Arrange
		jest.mocked( getContainer ).mockReturnValue( {
			settings: { get: () => 'e-paragraph' },
			type: 'e-paragraph',
		} as never );
		const handler = getHandler();

		// Act
		const act = () => handler( { elementId: ELEMENT_ID, title: GENERATED_TITLE } );

		// Assert
		expect( act ).toThrow( `Element with ID ${ ELEMENT_ID } is not an e-heading element` );
		expect( doUpdateElementProperty ).not.toHaveBeenCalled();
	} );
} );
