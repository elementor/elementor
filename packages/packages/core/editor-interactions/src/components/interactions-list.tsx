import * as React from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { EyeIcon, XIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, IconButton, Popover, Stack, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePopupStateContext } from '../contexts/popup-state-contex';
import { getInteractionsConfig } from '../utils/get-interactions-config';
import { Header } from './header';
import { InteractionDetails } from './interaction-details';

type PredefinedInteractionsListProps = {
	onSelectInteraction: ( interaction: string ) => void;
	selectedInteraction: string;
	onDelete?: () => void;
};

export const PredefinedInteractionsList = ( {
	onSelectInteraction,
	selectedInteraction,
	onDelete,
}: PredefinedInteractionsListProps ) => {
	return (
		<Stack sx={ { m: 1, p: 1.5 } } gap={ 2 }>
			<Header label={ __( 'Interactions', 'elementor' ) } />
			<InteractionsList
				onDelete={ () => onDelete?.() }
				selectedInteraction={ selectedInteraction }
				onSelectInteraction={ onSelectInteraction }
			/>
		</Stack>
	);
};

type InteractionListProps = {
	onDelete: () => void;
	onSelectInteraction: ( interaction: string ) => void;
	selectedInteraction: string;
	defaultStateRef?: React.MutableRefObject< boolean | undefined >;
};

function InteractionsList( { onSelectInteraction, selectedInteraction, defaultStateRef }: InteractionListProps ) {
	const [ interactionId, setInteractionId ] = useState( selectedInteraction );

	const anchorEl = useRef< HTMLDivElement | null >( null );

	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-interactions-list-${ popupId }`,
	} );

	const { openByDefault, resetDefaultOpen } = usePopupStateContext();

	useEffect( () => {
		if ( interactionId ) {
			onSelectInteraction( interactionId );
		}
	}, [ interactionId, onSelectInteraction ] );

	useEffect( () => {
		if ( openByDefault && anchorEl.current ) {
			popupState.open();
			resetDefaultOpen();
		}
	}, [ defaultStateRef, openByDefault, popupState, resetDefaultOpen ] );

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
						<IconButton size="tiny" disabled>
							<EyeIcon fontSize="tiny" />
						</IconButton>
						<IconButton size="tiny">
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
