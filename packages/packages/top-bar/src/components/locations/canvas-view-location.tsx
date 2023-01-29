import { Fragment } from 'react';
import { useInjectionsOf } from '@elementor/locations';
import { LOCATION_CANVAS_VIEW } from '../../locations';
import HorizontalMenu from '../misc/horizontal-menu';
import Divider from '../misc/divider';

export default function CanvasViewLocation() {
	const injections = useInjectionsOf( LOCATION_CANVAS_VIEW );

	return (
		<HorizontalMenu>
			{ injections.map(
				( { filler: Filler, id }, index ) => (
					<Fragment key={ id }>
						{ index === 0 && <Divider /> }
						<Filler />
						<Divider />
					</Fragment>
				)
			) }
		</HorizontalMenu>
	);
}
