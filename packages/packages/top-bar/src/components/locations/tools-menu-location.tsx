import * as React from 'react';
import { useInjectionsOf } from '@elementor/locations';
import { LOCATION_TOOLS_MENU_DEFAULT } from '../../locations';
import ToolbarMenu from '../ui/toolbar-menu';
import ToolbarMenuMore from '../ui/toolbar-menu-more';

const MAX_TOOLBAR_ACTIONS = 5;

export default function ToolsMenuLocation() {
	const injections = useInjectionsOf( LOCATION_TOOLS_MENU_DEFAULT );

	const toolbarInjections = injections.slice( 0, MAX_TOOLBAR_ACTIONS );
	const popoverInjections = injections.slice( MAX_TOOLBAR_ACTIONS );

	return (
		<ToolbarMenu>
			{ toolbarInjections.map( ( { filler: Filler, id } ) => <Filler key={ id } /> ) }
			{ popoverInjections.length > 0 && (
				<ToolbarMenuMore id="elementor-editor-top-bar-tools-more">
					{ popoverInjections.map( ( { filler: Filler, id } ) => <Filler key={ id } /> ) }
				</ToolbarMenuMore>
			) }
		</ToolbarMenu>
	);
}
