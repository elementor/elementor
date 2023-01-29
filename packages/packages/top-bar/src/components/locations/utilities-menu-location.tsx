import { Fragment } from 'react';
import { useInjectionsOf } from '@elementor/locations';
import HorizontalMenu from '../misc/horizontal-menu';
import { LOCATION_UTILITIES_MENU_DEFAULT } from '../../locations';
import Divider from '../misc/divider';

export default function UtilitiesMenuLocation() {
	const injections = useInjectionsOf( LOCATION_UTILITIES_MENU_DEFAULT );

	return (
		<HorizontalMenu>
			{ injections.map(
				( { filler: Filler, id }, index ) => (
					<Fragment key={ id }>
						{ index === 0 && <Divider /> }
						<Filler />
					</Fragment>
				)
			) }
		</HorizontalMenu>
	);
}
