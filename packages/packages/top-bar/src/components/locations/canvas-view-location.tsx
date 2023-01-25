import { Fragment } from 'react';
import { useInjectionsAt } from '@elementor/locations';
import { LOCATION_CANVAS_VIEW } from '../../locations';
import HorizontalMenu from '../misc/horizontal-menu';
import Divider from '../misc/divider';

export default function LocationCanvasView() {
	const injections = useInjectionsAt( LOCATION_CANVAS_VIEW );

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
