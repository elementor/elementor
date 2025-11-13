import * as React from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PlayerPlayIcon, XIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, IconButton, Popover, Stack, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePopupStateContext } from '../contexts/popup-state-context';
import { getInteractionsConfig } from '../utils/get-interactions-config';
import { Header } from './header';
import { InteractionDetails } from './interaction-details';

type PredefinedInteractionsListProps = {
	onSelectInteraction: ( interaction: string ) => void;
	selectedInteraction: string;
	onDelete?: () => void;
	onPlayInteraction: () => void;
};

export const PredefinedInteractionsList = ( {
	onSelectInteraction,
	selectedInteraction,
	onDelete,
	onPlayInteraction,
}: PredefinedInteractionsListProps ) => {
	return (
		<Stack sx={ { m: 1, p: 1.5 } } gap={ 2 }>
			<Header label={ __( 'Interactions', 'elementor' ) } />
			<InteractionsList
				onDelete={ onDelete }
				selectedInteraction={ selectedInteraction }
				onSelectInteraction={ onSelectInteraction }
				onPlayInteraction={ onPlayInteraction }
			/>
		</Stack>
	);
};

type InteractionListProps = {
	onDelete?: () => void;
	onSelectInteraction: ( interaction: string ) => void;
	selectedInteraction: string;
	defaultStateRef?: React.MutableRefObject< boolean | undefined >;
	onPlayInteraction: () => void;
};

function InteractionsList( props: InteractionListProps ) {
	const { onSelectInteraction, selectedInteraction, defaultStateRef, onDelete, onPlayInteraction } = props;

	const [ interactionId, setInteractionId ] = useState( selectedInteraction );

	const anchorEl = useRef< HTMLDivElement | null >( null );

	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-interactions-list-${ popupId }`,
	} );

	const { openByDefault, resetDefaultOpen } = usePopupStateContext();

	useEffect( () => {
		if ( interactionId && interactionId !== selectedInteraction ) {
			onSelectInteraction( interactionId );
		}
	}, [ interactionId, selectedInteraction, onSelectInteraction ] );

	useEffect( () => {
		if ( openByDefault && anchorEl.current ) {
			popupState.setAnchorEl( anchorEl.current );
			popupState.open();
			resetDefaultOpen();
		}
	}, [ defaultStateRef, popupState, anchorEl, openByDefault, resetDefaultOpen ] );

	const displayLabel = useMemo( () => {
		if ( ! interactionId ) {
			return '';
		}

		const animationOptions = getInteractionsConfig()?.animationOptions;
		const option = animationOptions.find( ( opt ) => opt.value === interactionId );

		return option?.label || interactionId;
	}, [ interactionId ] );

	return (
		<Stack gap={ 1.5 } ref={ anchorEl }>
			<UnstableTag
				{ ...bindTrigger( popupState ) }
				fullWidth
				variant="outlined"
				label={ displayLabel }
				showActionsOnHover
				actions={
					<>
						<IconButton size="tiny" onClick={ onPlayInteraction }>
							<PlayerPlayIcon fontSize="tiny" />
						</IconButton>
						<IconButton size="tiny" onClick={ () => onDelete?.() }>
							<XIcon fontSize="tiny" />
						</IconButton>
					</>
				}
			/>
			<Popover
				{ ...bindPopover( popupState ) }
				disableScrollLock
				anchorEl={ anchorEl.current }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
				transformOrigin={ { vertical: 'top', horizontal: 'left' } }
				PaperProps={ {
					sx: { my: 1 },
				} }
				onClose={ () => {
					popupState.close();
				} }
			>
				<InteractionDetails
					interaction={ selectedInteraction }
					onChange={ ( newValue: string ) => {
						setInteractionId( newValue );
					} }
				/>
			</Popover>
		</Stack>
	);
}
