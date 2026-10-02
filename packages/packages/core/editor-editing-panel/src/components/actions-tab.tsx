import * as React from 'react';
import { PlusIcon, XIcon } from '@elementor/icons';
import { Button, IconButton, Paper, Stack, Typography } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { getActionDefinitions } from './data-flow/actions/action-definitions';
import { type InputAction, isInputAction, type PlainAction } from './data-flow/actions/actions-props';
import { EventActionFields } from './data-flow/actions/event-action-fields';
import { InputActionFields } from './data-flow/actions/input-action-fields';
import { useElementActions } from './data-flow/actions/use-element-actions';
import { SectionsList } from './sections-list';

const NEW_EVENT_ACTION: PlainAction = { on: 'click', do: 'state/toggle', args: {} };

const NEW_INPUT_ACTION: InputAction = {
	input: 'pointer',
	space: 'local',
	write: { tilt_x: { from: 'y', map: [ -1, 1, 10, -10 ], spring: {} } },
};

export const ActionsTab = () => {
	const { element } = useElement();
	const { actions, addAction, updateAction, removeAction } = useElementActions( element.id );

	return (
		<SectionsList>
			<Stack gap={ 2 } sx={ { p: 2 } }>
				<Typography variant="caption" color="text.secondary">
					{ __(
						'Actions write state when something happens, or follow the pointer, scroll, drag or time. Read state in text with {{state.key}} and in styles with var(--e-state-key). Runs on the published page.',
						'elementor'
					) }
				</Typography>
				{ actions.map( ( action, index ) => (
					<ActionCard
						key={ index }
						action={ action }
						onChange={ ( next ) => updateAction( index, next ) }
						onRemove={ () => removeAction( index ) }
					/>
				) ) }
				<Stack direction="row" gap={ 1 }>
					<Button
						size="small"
						variant="outlined"
						fullWidth
						startIcon={ <PlusIcon fontSize="tiny" /> }
						onClick={ () => addAction( NEW_EVENT_ACTION ) }
					>
						{ __( 'Event', 'elementor' ) }
					</Button>
					<Button
						size="small"
						variant="outlined"
						fullWidth
						startIcon={ <PlusIcon fontSize="tiny" /> }
						onClick={ () => addAction( NEW_INPUT_ACTION ) }
					>
						{ __( 'Motion input', 'elementor' ) }
					</Button>
				</Stack>
			</Stack>
		</SectionsList>
	);
};

type ActionCardProps = {
	action: PlainAction;
	onChange: ( action: PlainAction ) => void;
	onRemove: () => void;
};

const ActionCard = ( { action, onChange, onRemove }: ActionCardProps ) => (
	<Paper variant="outlined" sx={ { p: 1.5 } }>
		<Stack gap={ 1.5 }>
			<Stack direction="row" alignItems="center" justifyContent="space-between" gap={ 1 }>
				<Typography variant="subtitle2" noWrap>
					{ getActionTitle( action ) }
				</Typography>
				<IconButton size="tiny" aria-label={ __( 'Remove action', 'elementor' ) } onClick={ onRemove }>
					<XIcon fontSize="tiny" />
				</IconButton>
			</Stack>
			{ isInputAction( action ) ? (
				<InputActionFields action={ action } onChange={ onChange } />
			) : (
				<EventActionFields action={ action } onChange={ onChange } />
			) }
		</Stack>
	</Paper>
);

function getActionTitle( action: PlainAction ): string {
	if ( isInputAction( action ) ) {
		/* translators: %s: input name, e.g. pointer. */
		return sprintf( __( 'Follow %s', 'elementor' ), action.input );
	}

	const label = getActionDefinitions().find( ( { name } ) => name === action.do )?.label ?? action.do;

	/* translators: 1: event name, 2: action label. */
	return sprintf( __( 'On %1$s: %2$s', 'elementor' ), action.on, label );
}
