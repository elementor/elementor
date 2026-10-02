import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { getWidgetsCache } from '@elementor/editor-elements';
import { PlusIcon, XIcon } from '@elementor/icons';
import { Button, Divider, IconButton, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../contexts/element-context';
import { Section } from '../section';
import { StateParamFields } from './state-param-fields';
import { useElementStateParams } from './use-element-state';

const WIDGET_EL_TYPE = 'widget';

export const StateSection = () => {
  const { element } = useElement();

  if ( getWidgetsCache()?.[ element.type ]?.elType === WIDGET_EL_TYPE ) {
    return null;
  }

  return <ContainerStateSection elementId={ element.id } />;
};

const ContainerStateSection = ( { elementId }: { elementId: string } ) => {
  const { stateParams, addStateParam, updateStateParam, removeStateParam } =
    useElementStateParams( elementId );

  return (
    <Section title={ __( 'State', 'elementor' ) } defaultExpanded>
      <Stack gap={ 2 }>
        { stateParams.map( ( param, index ) => (
          <Stack key={ index } gap={ 1.5 }>
            { 0 < index && <Divider /> }
            <Stack direction="row" alignItems="flex-start" gap={ 1 }>
              <Stack flex={ 1 } gap={ 0 }>
                { param.key ? (
                  <ControlFormLabel>{ param.key }</ControlFormLabel>
                ) : (
                  <ControlFormLabel>{ __( 'New state', 'elementor' ) }</ControlFormLabel>
                ) }
                <StateParamFields
                  param={ param }
                  onChange={ ( changes ) => updateStateParam( index, changes ) }
                />
              </Stack>
              <IconButton
                size="tiny"
                aria-label={ __( 'Remove state', 'elementor' ) }
                onClick={ () => removeStateParam( index ) }
              >
                <XIcon fontSize="tiny" />
              </IconButton>
            </Stack>
          </Stack>
        ) ) }
        <Button
          size="small"
          variant="outlined"
          startIcon={ <PlusIcon fontSize="tiny" /> }
          onClick={ addStateParam }
        >
          { __( 'Add state', 'elementor' ) }
        </Button>
      </Stack>
    </Section>
  );
};
