import { render } from '@testing-library/react';
import {
	ProWidgetsNotice,
} from 'elementor/modules/ai/assets/js/editor/pages/form-layout/components/pro-widgets-notice';
import useIntroduction from 'elementor/modules/ai/assets/js/editor/hooks/use-introduction';
import TestThemeProvider from '../../../mock/test-theme-provider';

jest.mock( 'elementor/modules/ai/assets/js/editor/hooks/use-introduction', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );
describe( 'ProWidgetsNotice', () => {
	it( 'Should render widget if user hasn\'t closed it yet', async () => {
		useIntroduction.mockImplementation( () => ( { isViewed: false } ) );
		const { getByText } = render(
			<TestThemeProvider>
				<ProWidgetsNotice />,
			</TestThemeProvider>,
		);

		const element = await getByText( 'Upgrade your plan for best results.' );

		expect( element ).toBeDefined();
	} );

	it( 'Should not render the widget if user has previously closed it', async () => {
		useIntroduction.mockImplementation( () => ( { isViewed: true } ) );
		const { getByTestId } = render(
			<TestThemeProvider>
				<ProWidgetsNotice />,
			</TestThemeProvider>,
		);

		const element = await getByTestId( 'root' );

		expect( element.children.length ).toBe( 0 );
	} );
} );
