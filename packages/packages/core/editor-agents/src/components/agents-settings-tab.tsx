import * as React from 'react';
import { useCallback, useState } from 'react';
import { __privateUseListenTo as useListenTo, routeOpenEvent } from '@elementor/editor-v1-adapters';
import { Box, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getSiteSettingsBag, readLlmsContent, writeLlmsContent } from '../llms-settings';

const TAB_ID = 'settings-agents';
const TAB_ROUTE = `panel/global/${ TAB_ID }`;

export function AgentsSettingsTab() {
  const [ value, setValue ] = useState( readLlmsContent );
  const [ isSettingsAvailable, setIsSettingsAvailable ] = useState(
    () => null !== getSiteSettingsBag()
  );

  useListenTo( [ routeOpenEvent( TAB_ROUTE ) ], () => {
    setIsSettingsAvailable( null !== getSiteSettingsBag() );
    setValue( readLlmsContent() );
  } );

  const handleChange = useCallback( ( event: React.ChangeEvent< HTMLInputElement > ) => {
    const nextValue = event.target.value;
    setValue( nextValue );
    writeLlmsContent( nextValue );
  }, [] );

  return (
    <Box sx={ { p: 2 } }>
      <Stack spacing={ 1.5 }>
        <Typography variant="subtitle2">{ __( 'Agents', 'elementor' ) }</Typography>
        <TextField
          label={ __( 'llms.txt', 'elementor' ) }
          value={ value }
          onChange={ handleChange }
          multiline
          minRows={ 12 }
          fullWidth
          disabled={ ! isSettingsAvailable }
          helperText={
            isSettingsAvailable
              ? __( 'Content served at /llms.txt when saved. Leave empty to disable.', 'elementor' )
              : __(
                  'Kit settings are unavailable. Reopen Site Settings and try again.',
                  'elementor'
                )
          }
        />
      </Stack>
    </Box>
  );
}

export const AGENTS_SITE_SETTINGS_TAB_ID = TAB_ID;
