import { Fragment } from 'react';
import { useInjectionsOf } from '@elementor/locations';
import ToolbarMenu from '../ui/toolbar-menu';
import { LOCATION_UTILITIES_MENU_DEFAULT } from '../../locations';
import { Divider } from '@elementor/ui';
import ToolbarMenuMore from '../ui/toolbar-menu-more';

const MAX_TOOLBAR_ACTIONS = 3;

export default function UtilitiesMenuLocation() {
	const injections = useInjectionsOf( LOCATION_UTILITIES_MENU_DEFAULT );

	const toolbarInjections = injections.slice( 0, MAX_TOOLBAR_ACTIONS );
	const popoverInjections = injections.slice( MAX_TOOLBAR_ACTIONS );

	return (
		<ToolbarMenu>
			{ toolbarInjections.map(
				( { filler: Filler, id }, index ) => (
					<Fragment key={ id }>
						{ index === 0 && <Divider orientation="vertical" /> }
						<Filler />
					</Fragment>
				)
			) }
			{ popoverInjections.length > 0 && (
				<ToolbarMenuMore id="elementor-editor-top-bar-utilities-more">
					{ popoverInjections.map( ( { filler: Filler, id } ) => <Filler key={ id } /> ) }
				</ToolbarMenuMore>
			) }
		</ToolbarMenu>
	);
}
