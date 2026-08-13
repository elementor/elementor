import { type StyleDefinitionState } from '@elementor/editor-styles';

import { useElement } from '../../contexts/element-context';
import { type StyleDefinitionStateWithNormal } from '../../styles-inheritance/types';
import { DEFAULT_PSEUDO_STATES, type PseudoStateOption } from './pseudo-states';

export function usePseudoStates(): PseudoStateOption[] {
  const { elementType } = useElement();
  const { pseudoStates = [] } = elementType;

  const additionalStates: PseudoStateOption[] = pseudoStates.map( ( { name, value } ) => ( {
    key: value as StyleDefinitionStateWithNormal,
    value: value as StyleDefinitionState,
    label: name,
  } ) );

  return [ ...DEFAULT_PSEUDO_STATES, ...additionalStates ];
}
