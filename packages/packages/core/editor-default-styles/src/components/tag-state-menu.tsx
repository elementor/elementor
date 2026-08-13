import * as React from 'react';
import { DEFAULT_PSEUDO_STATES, PseudoStateMenuItems } from '@elementor/editor-editing-panel';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import { bindMenu, Menu, type PopupState } from '@elementor/ui';

type TagStateMenuProps = {
  popupState: PopupState;
  anchorEl: HTMLElement | null;
  activeState: StyleDefinitionState | null;
  onSelectState: ( state: StyleDefinitionState | null ) => void;
};

export function TagStateMenu( {
  popupState,
  anchorEl,
  activeState,
  onSelectState,
}: TagStateMenuProps ) {
  return (
    <Menu
      MenuListProps={ { dense: true, sx: { minWidth: '160px' } } }
      { ...bindMenu( popupState ) }
      anchorEl={ anchorEl }
      anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
      transformOrigin={ { horizontal: 'left', vertical: -4 } }
      disableAutoFocusItem
    >
      <PseudoStateMenuItems
        states={ DEFAULT_PSEUDO_STATES }
        activeState={ activeState }
        onSelectState={ onSelectState }
        onClose={ popupState.close }
      />
    </Menu>
  );
}
