import { Fragment } from 'react';
import { useInjectionsOf } from '@elementor/locations';
import { LOCATION_CANVAS_VIEW } from '../../locations';
import ToolbarMenu from '../ui/toolbar-menu';
import Divider from '../ui/divider';

export default function CanvasViewLocation() {
	const injections = useInjectionsOf( LOCATION_CANVAS_VIEW );

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
