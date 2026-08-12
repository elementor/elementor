import { type ActionProps } from '@elementor/editor-app-bar';
import { TextIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { usePanelActions } from '../default-styles-panel';

export function useDefaultStylesActionProps(): ActionProps {
  const { open } = usePanelActions();

  return {
    title: __( 'Default Styles', 'elementor' ),
    icon: TextIcon,
    onClick: () => {
      void open();
    },
  };
}
