import * as React from 'react';
import { PopoverContent } from '@elementor/editor-controls';
import { type InteractionItem } from '@elementor/editor-elements';

import { Divider, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	buildInteractionItem,
	DEFAULT_INTERACTION_DETAILS,
	parseInteractionItem,
	type InteractionDetailsForUI,
} from '../utils/interactions-helpers';

import { Direction } from './controls/direction';
import { Effect } from './controls/effect';
import { EffectType } from './controls/effect-type';
import { TimeFrameIndicator } from './controls/time-frame-indicator';
import { Trigger } from './controls/trigger';

const DELIMITER = '-';

type InteractionDetailsProps = {
	interactionItem: InteractionItem;
	onChange: ( interactionItem: InteractionItem ) => void;
};
export const DEFAULT_INTERACTION = 'load-fade-in--300-0';

// const getDefaultInteractionDetails = () => {
// 	const [ trigger, effect, type, direction, duration, delay ] = DEFAULT_INTERACTION.split( DELIMITER );

// 	return {
// 		trigger,
// 		effect,
// 		type,
// 		direction,
// 		duration,
// 		delay,
// 	};
// };

// const buildInteractionDetails = ( interaction: string ) => {
// 	const [ trigger, effect, type, direction, duration, delay ] = interaction.split( DELIMITER );
// 	const defaultInteractionDetails = getDefaultInteractionDetails();

// 	return {
// 		trigger: trigger || defaultInteractionDetails.trigger,
// 		effect: effect || defaultInteractionDetails.effect,
// 		type: type || defaultInteractionDetails.type,
// 		direction: direction || defaultInteractionDetails.direction,
// 		duration: duration || defaultInteractionDetails.duration,
// 		delay: delay || defaultInteractionDetails.delay,
// 	};
// };

export const InteractionDetails = ( { interactionItem, onChange }: InteractionDetailsProps ) => {
	const interactionDetails = React.useMemo( () => {
		return parseInteractionItem( interactionItem );
	}, [ interactionItem ] );

	const handleChange = < K extends keyof  InteractionDetailsForUI >(
		key: K,
		value: InteractionDetailsForUI[ K ]
	) => {
		if ( value === null || value === undefined ) {
			value = DEFAULT_INTERACTION_DETAILS[ key ] as InteractionDetailsForUI[ K ];
		}
		
		const newInteractionDetails = { ...interactionDetails, [ key ]: value };
		const newInteractionItem = buildInteractionItem( newInteractionDetails, interactionItem );
		onChange( newInteractionItem );
	};

	return (
		<PopoverContent p={ 1.5 }>
			<Grid container spacing={ 1.5 }>
				<Trigger value={ interactionDetails.trigger } onChange={ ( v ) => handleChange( 'trigger', v ) } />
			</Grid>
			<Divider sx={ { mx: 1.5 } } />
			<Grid container spacing={ 1.5 }>
				<Effect value={ interactionDetails.effect } onChange={ ( v ) => handleChange( 'effect', v ) } />
				<EffectType value={ interactionDetails.type } onChange={ ( v ) => handleChange( 'type', v ) } />
				<Direction
					value={ interactionDetails.direction }
					onChange={ ( v ) => handleChange( 'direction', v ) }
					interactionType={ interactionDetails.type }
				/>
				<TimeFrameIndicator
					value={ interactionDetails.duration }
					onChange={ ( v ) => handleChange( 'duration', v ) }
					label={ __( 'Duration', 'elementor' ) }
				/>
				<TimeFrameIndicator
					value={ interactionDetails.delay }
					onChange={ ( v ) => handleChange( 'delay', v ) }
					label={ __( 'Delay', 'elementor' ) }
				/>
			</Grid>
		</PopoverContent>
	);
};
