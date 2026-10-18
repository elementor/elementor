import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { type ElementStateParam } from '@elementor/editor-elements';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Stack, Switch, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { Section } from '../section';
import { formatStateValue, parseStateInput } from './state-values';
import { useElementStateValues } from './use-element-state';

const DATA_FLOW_EXPERIMENT = 'e_data_flow';

type ComponentStateSectionProps = {
  componentId: number;
  elementId: string;
};

export const ComponentStateSection = ( { componentId, elementId }: ComponentStateSectionProps ) => {
  const params = getComponentStateParams( componentId );

  if ( ! isExperimentActive( DATA_FLOW_EXPERIMENT ) || ! params.length ) {
    return null;
  }

  return <ComponentStateFields elementId={ elementId } params={ params } />;
};

const ComponentStateFields = ( {
  elementId,
  params,
}: {
  elementId: string;
  params: ElementStateParam[];
} ) => {
  const { state, setValue, clearValue } = useElementStateValues( elementId );

  return (
    <Section title={ __( 'State', 'elementor' ) } defaultExpanded>
      <Stack gap={ 1.5 }>
        { params.map( ( param ) => (
          <ComponentStateField
            key={ param.key }
            param={ param }
            value={ state[ param.key ] }
            onChange={ ( nextValue ) =>
              undefined === nextValue || '' === nextValue
                ? clearValue( param.key )
                : setValue( param.key, nextValue )
            }
          />
        ) ) }
      </Stack>
    </Section>
  );
};

const ComponentStateField = ( {
  param,
  value,
  onChange,
}: {
  param: ElementStateParam;
  value: unknown;
  onChange: ( value: unknown ) => void;
} ) => {
  const label = param.label || param.key;
  const placeholder = formatStateValue( param.default );

  if ( 'boolean' === param.type ) {
    return (
      <Stack gap={ 1 } direction="row" alignItems="center" justifyContent="space-between">
        <ControlFormLabel sx={ { mb: 0 } }>{ label }</ControlFormLabel>
        <Switch
          size="small"
          checked={ 'boolean' === typeof value ? value : Boolean( param.default ) }
          onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
            onChange( event.target.checked )
          }
          inputProps={ { 'aria-label': label } }
        />
      </Stack>
    );
  }

  const displayValue = undefined === value || null === value ? '' : formatStateValue( value );

  return (
    <Stack gap={ 1 }>
      <ControlFormLabel>{ label }</ControlFormLabel>
      <TextField
        size="tiny"
        fullWidth
        value={ displayValue }
        placeholder={ placeholder }
        inputProps={ { 'aria-label': label, spellCheck: false } }
        onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
          onChange( parseStateInput( event.target.value, param.type ) )
        }
      />
    </Stack>
  );
};

function getComponentStateParams( componentId: number ): ElementStateParam[] {
  return window.elementor?.config?.dataFlow?.componentParams?.[ componentId ] ?? [];
}
