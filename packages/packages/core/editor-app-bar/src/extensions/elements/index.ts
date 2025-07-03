import { toolsMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';
import syncPanelTitle from './sync/sync-panel-title';

export function init() {
	syncPanelTitle();

	toolsMenu.registerToggleAction( {
		id: 'open-elements-panel',
		priority: 1,
		useProps: useActionProps,
	} );
}
