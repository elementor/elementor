import { render } from '@testing-library/react';
import LayoutAppWrapper from 'elementor/modules/ai/assets/js/editor/layout-app-wrapper';
import { useTheme } from '@elementor/ui';

const Test = () => {
	const theme = useTheme();

	return (
		<div data-testid="root" dir={ theme.direction } className={ theme.palette.mode } />
	);
};

describe( 'LayoutAppWrapper', () => {
	it( 'Should be ltr and light by default', async () => {
		const { getByTestId } = render(
			<LayoutAppWrapper>
				<Test />
			</LayoutAppWrapper>,
		);

		const root = await getByTestId( 'root' );

		expect( root.attributes.dir.value ).toBe( 'ltr' );
		expect( root.className ).toBe( 'light' );
	} );

	it( 'Should be rtl and dark when set', async () => {
		const { getByTestId } = render(
			<LayoutAppWrapper colorScheme="dark" isRTL={ true }>
				<Test />
			</LayoutAppWrapper>,
		);

		const root = await getByTestId( 'root' );

		expect( root.attributes.dir.value ).toBe( 'rtl' );
		expect( root.className ).toBe( 'dark' );
	} );
} );
