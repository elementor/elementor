import { type StyleDefinitionState } from '@elementor/editor-styles';
import { __ } from '@wordpress/i18n';

import { type StyleDefinitionStateWithNormal } from '../../styles-inheritance/types';

export type PseudoStateOption = {
  key: StyleDefinitionStateWithNormal;
  value: StyleDefinitionState | null;
  label: string;
};

export const DEFAULT_PSEUDO_STATES: PseudoStateOption[] = [
  { key: 'normal', value: null, label: __( 'normal', 'elementor' ) },
  { key: 'hover', value: 'hover', label: __( 'hover', 'elementor' ) },
  { key: 'focus', value: 'focus', label: __( 'focus', 'elementor' ) },
  { key: 'active', value: 'active', label: __( 'active', 'elementor' ) },
];
