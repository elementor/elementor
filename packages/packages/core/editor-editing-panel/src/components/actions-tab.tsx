import * as React from 'react';
import { type ElementHandler, type ElementHandlerEvent } from '@elementor/editor-elements';
import { MenuListItem } from '@elementor/editor-ui';
import { PlusIcon, XIcon } from '@elementor/icons';
import { Button, IconButton, Select, type SelectChangeEvent, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { useElementHandlers } from '../hooks/use-element-handlers';
import { SectionsList } from './sections-list';

const HANDLER_EVENTS: ElementHandlerEvent[] = [
	'init',
	'click',
	'input',
	'change',
	'submit',
	'mouseenter',
	'mouseleave',
];

const CODE_MIN_ROWS = 4;

export const HandlersTab = () => {
	const { element } = useElement();
	const { handlers, addHandler, updateHandler, removeHandler } = useElementHandlers( element.id );

	return (
		<SectionsList>
			<Stack gap={ 2 } sx={ { p: 2 } }>
				<Typography variant="caption" color="text.secondary">
					{ __(
						'Plain JavaScript. Available: element, event, state, getState(), setState(key, value), subscribe(key, listener). Bind state in any text with {{state.key}}. Runs on the published page only.',
						'elementor'
					) }
				</Typography>
				{ handlers.map( ( handler, index ) => (
					<HandlerItem
						key={ index }
						handler={ handler }
						onChange={ ( changes ) => updateHandler( index, changes ) }
						onRemove={ () => removeHandler( index ) }
					/>
				) ) }
				<Button
					size="small"
					variant="outlined"
					startIcon={ <PlusIcon fontSize="tiny" /> }
					onClick={ addHandler }
				>
					{ __( 'Add handler', 'elementor' ) }
				</Button>
			</Stack>
		</SectionsList>
	);
};

type HandlerItemProps = {
	handler: ElementHandler;
	onChange: ( changes: Partial< ElementHandler > ) => void;
	onRemove: () => void;
};

const HandlerItem = ( { handler, onChange, onRemove }: HandlerItemProps ) => (
	<Stack gap={ 1 }>
		<Stack direction="row" gap={ 1 } alignItems="center">
			<Select
				size="tiny"
				fullWidth
				value={ handler.event }
				inputProps={ { 'aria-label': __( 'Handler event', 'elementor' ) } }
				onChange={ ( event: SelectChangeEvent< ElementHandlerEvent > ) =>
					onChange( { event: event.target.value as ElementHandlerEvent } )
				}
			>
				{ HANDLER_EVENTS.map( ( eventName ) => (
					<MenuListItem key={ eventName } value={ eventName }>
						{ eventName }
					</MenuListItem>
				) ) }
			</Select>
			<IconButton size="tiny" aria-label={ __( 'Remove handler', 'elementor' ) } onClick={ onRemove }>
				<XIcon fontSize="tiny" />
			</IconButton>
		</Stack>
		<TextField
			size="tiny"
			multiline
			fullWidth
			minRows={ CODE_MIN_ROWS }
			value={ handler.code }
			placeholder={ 'setState( "count", ( count ) => count + 1 );' }
			inputProps={ { 'aria-label': __( 'Handler code', 'elementor' ), spellCheck: false } }
			sx={ { '& textarea': { fontFamily: 'monospace', fontSize: 12 } } }
			onChange={ ( event: React.ChangeEvent< HTMLTextAreaElement > ) => onChange( { code: event.target.value } ) }
		/>
	</Stack>
);
