import { injectIntoTop } from '@elementor/editor';
import AppBar from './components/app-bar';
import { init as initExtensions } from './extensions';
import redirectOldMenus from './sync/redirect-old-menus';
import { toolsMenu } from './locations';
import { PlusIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import { useAIWidgetsPanelActions, useAIWidgetsPanelStatus } from '@elementor/editor-panels';

function useAIWidgetsActionProps() {
  const { open } = useAIWidgetsPanelActions();
  const { isOpen, isBlocked } = useAIWidgetsPanelStatus();
  return {
    title: __( 'AI Widgets', 'elementor' ),
    icon: PlusIcon,
    onClick: open,
    selected: isOpen,
    disabled: isBlocked,
  };
}

export function init() {
  redirectOldMenus();

  initExtensions();

  injectIntoTop( {
    id: 'app-bar',
    component: AppBar,
  } );

  // Register AI Widgets top bar button
  toolsMenu.registerToggleAction({
    id: 'open-ai-widgets-panel',
    priority: 20,
    useProps: useAIWidgetsActionProps,
  });
}
