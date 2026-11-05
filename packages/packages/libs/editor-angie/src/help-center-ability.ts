import type { AngieMcpSdk } from '@elementor-external/angie-sdk';

import { isAngiePluginActive } from './is-angie-plugin-active';

export type HelpCenterAbility = {
  /**
   * Registers the help-center ability on the Core SDK.
   * Empty until the ability's exposure is known. Replace this to switch implementations.
   */
  register: ( sdk: AngieMcpSdk ) => Promise< void >;
};

export const helpCenterAbility: HelpCenterAbility = {
  async register() {
    return undefined;
  },
};

let didRegister = false;

export const resetHelpCenterAbilityForTests = (): void => {
  didRegister = false;
};

/**
 * Registers the help-center ability on the Core SDK once.
 * Skipped while the Angie plugin is active, because that host already exposes it.
 */
export const ensureHelpCenterAbility = async ( sdk: AngieMcpSdk ): Promise< void > => {
  if ( isAngiePluginActive() || didRegister ) {
    return;
  }

  didRegister = true;

  try {
    await helpCenterAbility.register( sdk );
  } catch ( error ) {
    didRegister = false;
    throw error;
  }
};
