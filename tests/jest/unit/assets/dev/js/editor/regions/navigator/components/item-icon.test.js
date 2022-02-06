import { render } from '@testing-library/react';
import { ItemIcon } from 'elementor-regions/navigator/components';

describe( '<ItemIcon />', () => {
	it( 'Should render icon', () => {
		const iconName = 'eicon-heading',
			component = render(
				<ItemIcon icon={ iconName } />
			);

		expect(
			component.container.querySelector( `.${ iconName }` )
		).not.toBeNull();
	} );

	it( 'Should not render icon when not provided', () => {
		const component = render(
			<ItemIcon icon={ '' } />
		);

		expect(
			component.container.childNodes.length
		).toEqual( 0 );
	} );
} );
