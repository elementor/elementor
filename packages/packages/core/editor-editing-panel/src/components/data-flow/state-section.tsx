import * as React from 'react';
import { type ElementStateParam, type ElementStateParamType, getWidgetsCache } from '@elementor/editor-elements';
import { MenuListItem } from '@elementor/editor-ui';
import { PlusIcon, XIcon } from '@elementor/icons';
import { Button, IconButton, Select, type SelectChangeEvent, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../contexts/element-context';
import { Section } from '../section';
import { StateValueField } from './state-value-field';
import { formatStateValue, parseStateInput, STATE_PARAM_TYPES } from './state-values';
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
	const { stateParams, addStateParam, updateStateParam, removeStateParam } = useElementStateParams( elementId );

	return (
		<Section title={ __( 'State', 'elementor' ) } defaultExpanded>
			<Stack gap={ 2 }>
				<Typography variant="caption" color="text.secondary">
					{ __(
						'State owned by this container. Children read it with {{state.key}}. A default of {{state.key}} copies a value from an outer scope once.',
						'elementor'
					) }
				</Typography>
				{ stateParams.map( ( param, index ) => (
					<StateParamItem
						key={ index }
						param={ param }
						onChange={ ( changes ) => updateStateParam( index, changes ) }
						onRemove={ () => removeStateParam( index ) }
					/>
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

type StateParamItemProps = {
	param: ElementStateParam;
	onChange: ( changes: Partial< ElementStateParam > ) => void;
	onRemove: () => void;
};

const StateParamItem = ( { param, onChange, onRemove }: StateParamItemProps ) => (
	<Stack gap={ 1 }>
		<Stack direction="row" gap={ 1 } alignItems="center">
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
			<Select
				size="tiny"
				value={ param.type }
				inputProps={ { 'aria-label': __( 'State type', 'elementor' ) } }
				onChange={ ( event: SelectChangeEvent< ElementStateParamType > ) => {
					const type = event.target.value as ElementStateParamType;

					onChange( { type, default: parseStateInput( formatStateValue( param.default ), type ) } );
				} }
			>
				{ STATE_PARAM_TYPES.map( ( type ) => (
					<MenuListItem key={ type } value={ type }>
						{ type }
					</MenuListItem>
				) ) }
			</Select>
			<IconButton size="tiny" aria-label={ __( 'Remove state', 'elementor' ) } onClick={ onRemove }>
				<XIcon fontSize="tiny" />
			</IconButton>
		</Stack>
		<StateValueField
			label={ __( 'State default', 'elementor' ) }
			type={ param.type }
			value={ param.default }
			placeholder={ __( 'Default value', 'elementor' ) }
			onChange={ ( _, value ) => onChange( { default: value } ) }
		/>
	</Stack>
);
