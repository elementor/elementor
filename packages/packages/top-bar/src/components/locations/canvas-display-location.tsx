import { Fragment } from 'react';
import { useInjectionsOf } from '@elementor/locations';
import { LOCATION_CANVAS_DISPLAY } from '../../locations';
import ToolbarMenu from '../ui/toolbar-menu';
import { Divider } from '@elementor/ui';

export default function CanvasDisplayLocation() {
	const injections = useInjectionsOf( LOCATION_CANVAS_DISPLAY );

	return (
		<ToolbarMenu>
			{ injections.map(
				( { filler: Filler, id }, index ) => (
					<Fragment key={ id }>
						{ index === 0 && <Divider orientation="vertical" /> }
						<Filler />
						<Divider orientation="vertical" />
					</Fragment>
				)
			) }
		</ToolbarMenu>
	);
}
