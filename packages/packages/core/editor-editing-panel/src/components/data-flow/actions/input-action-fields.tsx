import * as React from 'react';
import { PlusIcon, XIcon } from '@elementor/icons';
import { Button, Divider, IconButton, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { INPUT_VALUES, INPUTS_WITH_SPACE } from './action-definitions';
import {
  FieldRow,
  parseNumber,
  SelectField,
  SwitchField,
  TextInput,
  toOptions,
} from './action-fields';
import { type InputAction, type StateWrite } from './actions-props';

const SPACES = [ 'local', 'global' ];
const REDUCED_MOTION_RUN = 'run';
const DEFAULT_INERTIA = 0.95;
const DEFAULT_SMOOTH = 0.85;
const RANGE_LABELS = [ 'In min', 'In max', 'Out min', 'Out max' ];
type RangeMap = [ number, number, number, number ];

const DEFAULT_MAP: RangeMap = [ -1, 1, 0, 1 ];

type Easing = 'none' | 'smooth' | 'spring';

type InputActionFieldsProps = {
  action: InputAction;
  onChange: ( action: InputAction ) => void;
};

export const InputActionFields = ( { action, onChange }: InputActionFieldsProps ) => {
  const writes = Object.entries( action.write );
  const inputValues = INPUT_VALUES[ action.input ] ?? [];

  const setWrites = ( entries: Array< [ string, StateWrite ] > ) =>
    onChange( { ...action, write: Object.fromEntries( entries ) } );

  return (
    <Stack gap={ 1 }>
      <SelectField
        label={ __( 'Input', 'elementor' ) }
        value={ action.input }
        options={ toOptions( Object.keys( INPUT_VALUES ) ) }
        onChange={ ( input ) =>
          onChange( {
            input,
            write: Object.fromEntries(
              writes.map( ( [ key, write ] ) => [
                key,
                { ...write, from: INPUT_VALUES[ input ][ 0 ] },
              ] )
            ),
          } )
        }
      />
      { INPUTS_WITH_SPACE.includes( action.input ) && (
        <SelectField
          label={ __( 'Track', 'elementor' ) }
          value={ action.space ?? 'global' }
          options={ toOptions( SPACES ) }
          onChange={ ( space ) => onChange( { ...action, space } ) }
        />
      ) }
      { 'drag' === action.input && (
        <TextInput
          label={ __( 'Inertia', 'elementor' ) }
          value={ action.inertia }
          placeholder={ String( DEFAULT_INERTIA ) }
          parse={ parseNumber }
          onChange={ ( inertia ) => onChange( { ...action, inertia } ) }
        />
      ) }
      <SwitchField
        label={ __( 'Run with reduced motion', 'elementor' ) }
        checked={ REDUCED_MOTION_RUN === action.reducedMotion }
        onChange={ ( checked ) =>
          onChange( { ...action, reducedMotion: checked ? REDUCED_MOTION_RUN : undefined } )
        }
      />
      { writes.map( ( [ key, write ], index ) => (
        <React.Fragment key={ index }>
          <Divider />
          <WriteFields
            stateKey={ key }
            write={ write }
            inputValues={ inputValues }
            onChange={ ( nextKey, nextWrite ) =>
              setWrites(
                writes.map( ( entry, entryIndex ) =>
                  entryIndex === index ? [ nextKey, nextWrite ] : entry
                )
              )
            }
            onRemove={ () =>
              setWrites( writes.filter( ( _, entryIndex ) => entryIndex !== index ) )
            }
          />
        </React.Fragment>
      ) ) }
      <Button
        size="small"
        variant="text"
        startIcon={ <PlusIcon fontSize="tiny" /> }
        onClick={ () =>
          setWrites( [ ...writes, [ `value_${ writes.length + 1 }`, { from: inputValues[ 0 ] } ] ] )
        }
      >
        { __( 'Write state key', 'elementor' ) }
      </Button>
    </Stack>
  );
};

type WriteFieldsProps = {
  stateKey: string;
  write: StateWrite;
  inputValues: string[];
  onChange: ( key: string, write: StateWrite ) => void;
  onRemove: () => void;
};

const WriteFields = ( { stateKey, write, inputValues, onChange, onRemove }: WriteFieldsProps ) => {
  const easing: Easing = write.spring ? 'spring' : ( write.smooth && 'smooth' ) || 'none';
  const update = ( changes: Partial< StateWrite > ) =>
    onChange( stateKey, { ...write, ...changes } );

  return (
    <Stack gap={ 1 }>
      <Stack direction="row" alignItems="center" gap={ 1 }>
        <TextInput
          label={ __( 'Write to state key', 'elementor' ) }
          value={ stateKey }
          placeholder="tilt_x"
          parse={ ( input ) => input }
          onChange={ ( key ) => onChange( key ?? '', write ) }
          hideLabel
        />
        <IconButton
          size="tiny"
          aria-label={ __( 'Remove state key', 'elementor' ) }
          onClick={ onRemove }
        >
          <XIcon fontSize="tiny" />
        </IconButton>
      </Stack>
      <SelectField
        label={ __( 'From', 'elementor' ) }
        value={ write.from }
        options={ toOptions( inputValues ) }
        onChange={ ( from ) => update( { from } ) }
      />
      <SwitchField
        label={ __( 'Map range', 'elementor' ) }
        checked={ !! write.map }
        onChange={ ( checked ) => update( { map: checked ? DEFAULT_MAP : undefined } ) }
      />
      { write.map && (
        <FieldRow label={ __( 'Range', 'elementor' ) }>
          { RANGE_LABELS.map( ( label, index ) => (
            <TextInput
              key={ label }
              label={ label }
              value={ write.map?.[ index ] }
              parse={ parseNumber }
              onChange={ ( number ) => {
                const map: RangeMap = [ ...( write.map ?? DEFAULT_MAP ) ];
                map[ index ] = number ?? 0;
                update( { map } );
              } }
              hideLabel
            />
          ) ) }
        </FieldRow>
      ) }
      <SelectField
        label={ __( 'Easing', 'elementor' ) }
        value={ easing }
        options={ [
          { value: 'none', label: __( 'None', 'elementor' ) },
          { value: 'smooth', label: __( 'Smooth', 'elementor' ) },
          { value: 'spring', label: __( 'Spring', 'elementor' ) },
        ] }
        onChange={ ( next ) =>
          update( {
            smooth: 'smooth' === next ? DEFAULT_SMOOTH : undefined,
            spring: 'spring' === next ? {} : undefined,
          } )
        }
      />
      { 'smooth' === easing && (
        <TextInput
          label={ __( 'Smoothing', 'elementor' ) }
          value={ write.smooth }
          parse={ parseNumber }
          onChange={ ( smooth ) => update( { smooth } ) }
        />
      ) }
      { 'spring' === easing && (
        <>
          <TextInput
            label={ __( 'Stiffness', 'elementor' ) }
            value={ write.spring?.stiffness }
            placeholder="170"
            parse={ parseNumber }
            onChange={ ( stiffness ) => update( { spring: { ...write.spring, stiffness } } ) }
          />
          <TextInput
            label={ __( 'Damping', 'elementor' ) }
            value={ write.spring?.damping }
            placeholder="26"
            parse={ parseNumber }
            onChange={ ( damping ) => update( { spring: { ...write.spring, damping } } ) }
          />
        </>
      ) }
      <TextInput
        label={ __( 'Decimals', 'elementor' ) }
        value={ write.round }
        parse={ parseNumber }
        onChange={ ( round ) => update( { round } ) }
      />
    </Stack>
  );
};
