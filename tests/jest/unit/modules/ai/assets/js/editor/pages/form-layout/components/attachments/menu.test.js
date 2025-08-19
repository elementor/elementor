import { render } from '@testing-library/react';
import useIntroduction from 'elementor/modules/ai/assets/js/editor/hooks/use-introduction';
import {
	Menu,
} from 'elementor/modules/ai/assets/js/editor/pages/form-layout/components/attachments/menu';

jest.mock( 'elementor/modules/ai/assets/js/editor/hooks/use-introduction', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

describe( 'Menu Component', () => {
	it( 'should display a badge when viewed for the first time', () => {
		useIntroduction.mockReturnValue( { isViewed: false, markAsViewed: jest.fn() } );

		const { container } = render( <Menu items={ [] } onAttach={ () => {
		} } /> );

		const badge = container.querySelector( '.eui-badge' );
		expect( badge ).toBeDefined();
	} );

	it( 'should not display a badge when viewed again', () => {
		useIntroduction.mockReturnValue( { isViewed: true, markAsViewed: jest.fn() } );

		const { container } = render( <Menu items={ [] } onAttach={ () => {
		} } /> );

		const badge = container.querySelector( '.eui-badge' );
		expect( badge ).toBeNull();
	} );
} );

