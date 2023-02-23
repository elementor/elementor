import { Fragment } from 'react';
import { useInjectionsOf } from '@elementor/locations';
import ToolbarMenu from '../ui/toolbar-menu';
import { LOCATION_UTILITIES_MENU_DEFAULT } from '../../locations';
import { Divider } from '@elementor/ui';

export default function UtilitiesMenuLocation() {
	const injections = useInjectionsOf( LOCATION_UTILITIES_MENU_DEFAULT );

	return (
		<ToolbarMenu>
			{ injections.map(
				( { filler: Filler, id }, index ) => (
					<Fragment key={ id }>
						{ index === 0 && <Divider orientation="vertical" /> }
						<Filler />
					</Fragment>
				)
			) }
		</ToolbarMenu>
	);
}
