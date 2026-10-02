import * as React from 'react';
import { Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { EVENTS, getActionDefinitions, STATE_EVENT } from './action-definitions';
import { parseNumber, parseText, SelectField, SwitchField, TextInput, toOptions } from './action-fields';
import { type ActionArgValue, type ArgPropType, type EventAction } from './actions-props';

type EventActionFieldsProps = {
	action: EventAction;
	onChange: ( action: EventAction ) => void;
};

export const EventActionFields = ( { action, onChange }: EventActionFieldsProps ) => {
	const definitions = getActionDefinitions();
	const definition = definitions.find( ( { name } ) => name === action.do );

	const setArg = ( key: string, value: ActionArgValue | undefined ) => {
		const { [ key ]: _removed, ...rest } = action.args;

		onChange( { ...action, args: value === undefined ? rest : { ...rest, [ key ]: value } } );
	};

	return (
		<Stack gap={ 1 }>
			<SelectField
				label={ __( 'When', 'elementor' ) }
				value={ action.on }
				options={ toOptions( EVENTS ) }
				onChange={ ( on ) => onChange( { ...action, on, key: STATE_EVENT === on ? action.key : undefined } ) }
			/>
			{ STATE_EVENT === action.on && (
				<TextInput
					label={ __( 'State key', 'elementor' ) }
					value={ action.key }
					placeholder="open"
					parse={ parseText }
					onChange={ ( key ) => onChange( { ...action, key } ) }
				/>
			) }
			<SelectField
				label={ __( 'Do', 'elementor' ) }
				value={ action.do }
				options={ definitions.map( ( { name, label } ) => ( { value: name, label } ) ) }
				onChange={ ( name ) => onChange( { ...action, do: name, args: {} } ) }
			/>
			{ definition?.description && (
				<Typography variant="caption" color="text.tertiary">
					{ definition.description }
				</Typography>
			) }
			<Stack gap={ 1 } key={ action.do }>
				{ Object.entries( definition?.args ?? {} ).map( ( [ key, schema ] ) => (
					<ArgField
						key={ key }
						label={ schema.meta?.label || key }
						schema={ schema }
						value={ action.args[ key ] }
						onChange={ ( value ) => setArg( key, value ) }
					/>
				) ) }
			</Stack>
		</Stack>
	);
};

type ArgFieldProps = {
	label: string;
	schema: ArgPropType;
	value: ActionArgValue | undefined;
	onChange: ( value: ActionArgValue | undefined ) => void;
};

const ArgField = ( { label, schema, value, onChange }: ArgFieldProps ) => {
	if ( schema.settings?.enum?.length ) {
		return (
			<SelectField
				label={ label }
				value={ String( value ?? '' ) }
				options={ toOptions( schema.settings.enum ) }
				onChange={ onChange }
			/>
		);
	}

	switch ( schema.kind === 'union' ? 'value' : schema.key ) {
		case 'boolean':
			return <SwitchField label={ label } checked={ Boolean( value ) } onChange={ onChange } />;
		case 'number':
			return <TextInput label={ label } value={ value } parse={ parseNumber } onChange={ onChange } />;
		case 'string-array':
			return (
				<TextInput
					label={ label }
					value={ value as string[] | undefined }
					placeholder="one, two, three"
					format={ ( list ) => ( list ?? [] ).join( ', ' ) }
					parse={ parseList }
					onChange={ onChange }
				/>
			);
		case 'value':
			return <TextInput label={ label } value={ value } parse={ parseScalar } onChange={ onChange } />;
		default:
			return <TextInput label={ label } value={ value } parse={ parseText } onChange={ onChange } />;
	}
};

const parseList = ( input: string ) => {
	const list = input
		.split( ',' )
		.map( ( item ) => item.trim() )
		.filter( Boolean );

	return list.length ? list : undefined;
};

const parseScalar = ( input: string ): ActionArgValue | undefined => {
	if ( 'true' === input || 'false' === input ) {
		return 'true' === input;
	}

	return parseNumber( input ) ?? parseText( input );
};
