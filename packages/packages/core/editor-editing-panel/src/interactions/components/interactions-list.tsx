import * as React from 'react';
import { EyeIcon, XIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, IconButton, Popover, Stack, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { formatInteractionLabel } from '../utils/format-interaction-label';
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
};

function InteractionsList( { onSelectInteraction, selectedInteraction }: InteractionListProps ) {
	const [ interactionId, setInteractionId ] = React.useState( selectedInteraction );

	const anchorEl = React.useRef< HTMLDivElement | null >( null );

	const popupId = React.useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-interactions-list-${ popupId }`,
	} );

	React.useEffect( () => {
		if ( interactionId ) {
			onSelectInteraction( interactionId );
		}
	}, [ interactionId, onSelectInteraction ] );

	const displayLabel = React.useMemo( () => {
		return formatInteractionLabel( interactionId );
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
