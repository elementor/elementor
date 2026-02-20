import * as React from 'react';
import { useCallback } from 'react';
import { Divider, Tab, TabPanel, Tabs, useTabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useInteractionItemContext } from '../contexts/interactions-item-context';
import type { InteractionItemPropValue, InteractionItemValue } from '../types';
import { extractString } from '../utils/prop-value-utils';
import { InteractionDetails } from './interaction-details';
import { InteractionSettings } from './interaction-settings';
import { isProInteraction } from '../utils/is-pro-interaction';
import { ProInteractionDisabledContent } from './pro-interaction-disabled-content';


type InteractionTabValue = 'details' | 'settings';

export const InteractionsListItem = ( {
	index,
	value: interaction,
}: {
	index: number;
	value: InteractionItemPropValue;
} ) => {
	const { getTabsProps, getTabProps, getTabPanelProps } = useTabs< InteractionTabValue >( 'details' );

	const context = useInteractionItemContext();

	const handleChange = useCallback(
		( newInteractionValue: InteractionItemValue ) => {
			context?.onInteractionChange( index, newInteractionValue );
		},
		[ context, index ]
	);

	const handlePlayInteraction = useCallback(
		( interactionId: string ) => {
			context?.onPlayInteraction( interactionId );
		},
		[ context ]
	);

	const interactionId = extractString( interaction.value.interaction_id );
	if (isProInteraction(interaction)) {
		return <ProInteractionDisabledContent value={interaction} />;
	}

	return (
		<>
			<Tabs
				size="small"
				variant="fullWidth"
				aria-label={ __( 'Interaction', 'elementor' ) }
				{ ...getTabsProps() }
			>
				<Tab label={ __( 'Details', 'elementor' ) } { ...getTabProps( 'details' ) } />
				<Tab label={ __( 'Settings', 'elementor' ) } { ...getTabProps( 'settings' ) } />
			</Tabs>

			<Divider />

			<TabPanel sx={ { p: 0 } } { ...getTabPanelProps( 'details' ) }>
				<InteractionDetails
					key={ interactionId }
					interaction={ interaction.value }
					onChange={ handleChange }
					onPlayInteraction={ handlePlayInteraction }
				/>
			</TabPanel>

			<TabPanel sx={ { p: 0 } } { ...getTabPanelProps( 'settings' ) }>
				<InteractionSettings
					key={ interactionId }
					interaction={ interaction.value }
					onChange={ handleChange }
				/>
			</TabPanel>
		</>
	);
};
