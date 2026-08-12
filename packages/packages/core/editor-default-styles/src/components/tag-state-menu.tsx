import * as React from 'react';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import { MenuListItem } from '@elementor/editor-ui';
import { bindMenu, Menu, MenuSubheader, type PopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type PseudoState = {
  value: StyleDefinitionState | null;
  label: string;
};

const PSEUDO_STATES: PseudoState[] = [
  { value: null, label: __( 'normal', 'elementor' ) },
  { value: 'hover', label: __( 'hover', 'elementor' ) },
  { value: 'focus', label: __( 'focus', 'elementor' ) },
  { value: 'active', label: __( 'active', 'elementor' ) },
];

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
      <MenuSubheader sx={ { typography: 'caption', color: 'text.secondary', pb: 0.5, pt: 1 } }>
        { __( 'States', 'elementor' ) }
      </MenuSubheader>
      { PSEUDO_STATES.map( ( state ) => (
        <MenuListItem
          key={ state.value ?? 'normal' }
          selected={ state.value === activeState }
          sx={ { textTransform: 'capitalize' } }
          onClick={ () => {
            onSelectState( state.value );
            popupState.close();
          } }
        >
          { state.label }
        </MenuListItem>
      ) ) }
    </Menu>
  );
}
