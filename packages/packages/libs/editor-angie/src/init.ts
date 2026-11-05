import { bootAngieSdk } from './boot-angie-sdk';
import { ensureHelpCenterAbility } from './help-center-ability';
import { isAngiePluginActive } from './is-angie-plugin-active';

export function init(): void {
  void bootAngieSdk()
    .then( ( sdk ) => {
      if ( isAngiePluginActive() ) {
        return;
      }

      return ensureHelpCenterAbility( sdk );
    } )
    .catch( ( error ) => {
      // Boot can fail before the iframe exists. openAngie retries because the failed attempt is cleared.
      // eslint-disable-next-line no-console
      console.error( 'Angie SDK boot failed:', error );
    } );
}
