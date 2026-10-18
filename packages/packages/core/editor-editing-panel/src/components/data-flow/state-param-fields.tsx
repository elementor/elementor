import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { type ElementStateParam, type ElementStateParamType } from '@elementor/editor-elements';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent, Stack, Switch, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { formatStateValue, parseStateInput, STATE_PARAM_TYPES } from './state-values';

type StateParamFieldsProps = {
  param: ElementStateParam;
  onChange: ( changes: Partial< ElementStateParam > ) => void;
};

export const StateParamFields = ( { param, onChange }: StateParamFieldsProps ) => (
  <Stack gap={ 1.5 }>
    <Stack gap={ 1 }>
      <ControlFormLabel>{ __( 'Key', 'elementor' ) }</ControlFormLabel>
      <TextField
        size="tiny"
        fullWidth
        value={ param.key }
        placeholder="count"
        inputProps={ { 'aria-label': __( 'State key', 'elementor' ), spellCheck: false } }
        onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
          onChange( { key: event.target.value, label: event.target.value } )
        }
      />
    </Stack>
    <Stack gap={ 1 }>
      <ControlFormLabel>{ __( 'Type', 'elementor' ) }</ControlFormLabel>
      <Select
        size="tiny"
        fullWidth
        value={ param.type }
        inputProps={ { 'aria-label': __( 'State type', 'elementor' ) } }
        onChange={ ( event: SelectChangeEvent< ElementStateParamType > ) => {
          const type = event.target.value as ElementStateParamType;

          onChange( {
            type,
            default: parseStateInput( formatStateValue( param.default ), type ),
          } );
        } }
      >
        { STATE_PARAM_TYPES.map( ( type ) => (
          <MenuListItem key={ type } value={ type }>
            { type }
          </MenuListItem>
        ) ) }
      </Select>
    </Stack>
    <StateDefaultField param={ param } onChange={ onChange } />
  </Stack>
);

const StateDefaultField = ( {
  param,
  onChange,
}: {
  param: ElementStateParam;
  onChange: ( changes: Partial< ElementStateParam > ) => void;
} ) => {
  const label = __( 'Default', 'elementor' );

  if ( 'boolean' === param.type ) {
    return (
      <Stack gap={ 1 } direction="row" alignItems="center" justifyContent="space-between">
        <ControlFormLabel sx={ { mb: 0 } }>{ label }</ControlFormLabel>
        <Switch
          size="small"
          checked={ Boolean( param.default ) }
          onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
            onChange( { default: event.target.checked } )
          }
          inputProps={ { 'aria-label': label } }
        />
      </Stack>
    );
  }

  return (
    <Stack gap={ 1 }>
      <ControlFormLabel>{ label }</ControlFormLabel>
      <TextField
        size="tiny"
        fullWidth
        value={ formatStateValue( param.default ) }
        placeholder={ __( 'Default value', 'elementor' ) }
        inputProps={ { 'aria-label': __( 'State default', 'elementor' ), spellCheck: false } }
        onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
          onChange( { default: parseStateInput( event.target.value, param.type ) } )
        }
      />
      <ControlFormLabel sx={ { color: 'text.secondary', fontWeight: 400 } }>
        { __( 'Use {{state.key}} to copy from an outer scope once.', 'elementor' ) }
      </ControlFormLabel>
    </Stack>
  );
};
