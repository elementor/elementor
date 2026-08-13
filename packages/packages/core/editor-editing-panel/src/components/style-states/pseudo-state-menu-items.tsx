import * as React from 'react';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import { MenuListItem } from '@elementor/editor-ui';
import { MenuSubheader } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type PseudoStateOption } from './pseudo-states';

type PseudoStateMenuItemsProps = {
  states: PseudoStateOption[];
  activeState: StyleDefinitionState | null;
  onSelectState: ( state: StyleDefinitionState | null ) => void;
  onClose?: () => void;
};

export function PseudoStateMenuItems( {
  states,
  activeState,
  onSelectState,
  onClose,
}: PseudoStateMenuItemsProps ) {
  return (
    <>
      <MenuSubheader sx={ { typography: 'caption', color: 'text.secondary', pb: 0.5, pt: 1 } }>
        { __( 'States', 'elementor' ) }
      </MenuSubheader>
      { states.map( ( state ) => (
        <MenuListItem
          key={ state.key }
          selected={ state.value === activeState }
          sx={ { textTransform: 'capitalize' } }
          onClick={ () => {
            onSelectState( state.value );
            onClose?.();
          } }
        >
          { state.label }
        </MenuListItem>
      ) ) }
    </>
  );
}
