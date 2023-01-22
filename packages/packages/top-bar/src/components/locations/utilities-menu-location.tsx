import { Fragment } from 'react';
import { useInjectionsAt } from '@elementor/locations';
import HorizontalMenu from '../misc/horizontal-menu';
import { LOCATION_UTILITIES_MENU } from '../../locations';
import Divider from '../public/divider';

export default function UtilitiesMenuLocation() {
	const injections = useInjectionsAt( LOCATION_UTILITIES_MENU );

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
