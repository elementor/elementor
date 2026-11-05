import { type AngieInteractionMode, setAngieInteractionMode } from '@elementor-external/angie-sdk';

import { bootAngieSdk, EDITOR_ANGIE_APP_ID, openAngieIframe } from './boot-angie-sdk';

export const openAngie = async ( prompt: string, mode: AngieInteractionMode ): Promise< void > => {
  const sdk = await bootAngieSdk();

  openAngieIframe();
  setAngieInteractionMode( mode );

  await sdk.triggerAngie( {
    prompt,
    context: {
      source: EDITOR_ANGIE_APP_ID,
    },
  } );
};
