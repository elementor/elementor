import * as React from 'react';
import {
	ControlRepeater,
	ControlRepeaterContainer,
	ControlRepeaterItem,
	ControlRepeaterPopover,
	PopoverContent,
	PropProvider,
	RemoveItemAction,
	RepeaterHeader,
	TooltipAddItemAction,
	useBoundProp,
} from '@elementor/editor-controls';
import { type ArrayPropType, type PropType } from '@elementor/editor-props';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type InteractionsItemPropValue } from '../../prop-types/interaction-item';
import { interactionsPropTypeUtil } from '../../prop-types/interactions';
import { Content } from '../content';
import { CreateInteraction } from '../create-interaction';
import { PlayItemAction } from './play-item-action';

export const Repeater = () => {
	const context = useBoundProp( interactionsPropTypeUtil );
	const initialValue = context.propType.default as InteractionsItemPropValue;

	if ( ! context.value ) {
		return <CreateInteraction onClick={ () => context.setValue( [ { ...initialValue } ] ) } />;
	}

	return (
		<PropProvider { ...context }>
			<Stack sx={ { m: 1, p: 1.5 } } gap={ 2 }>
				<ControlRepeater initial={ initialValue } propTypeUtil={ interactionsPropTypeUtil }>
					<RepeaterHeader label={ __( 'Interactions', 'elementor' ) }>
						<TooltipAddItemAction newItemIndex={ 0 } />
					</RepeaterHeader>
					<ControlRepeaterContainer>
						<ControlRepeaterItem
							Icon={ () => null }
							Label={ ItemLabel }
							actions={
								<>
									<PlayItemAction />
									<RemoveItemAction />
								</>
							}
						/>
					</ControlRepeaterContainer>
					<ControlRepeaterPopover>
						<PopoverContent p={ 1.5 }>
							<Content />
						</PopoverContent>
					</ControlRepeaterPopover>
				</ControlRepeater>
			</Stack>
		</PropProvider>
	);
};

type TriggerOption = { value: string; label: string };

const ItemLabel = ( { value: interactionItem }: { value: InteractionsItemPropValue } ) => {
	const { propType } = useBoundProp( interactionsPropTypeUtil );

	const animationValue = interactionItem?.value?.animation?.value;

	const effect = capitalize( animationValue?.effect?.value );
	const effectType = capitalize( animationValue?.[ 'effect-type' ]?.value );
	const trigger = interactionItem?.value?.trigger?.value;

	const triggerLabel = findTriggerLabel( propType, trigger ?? '' );

	return (
		<span>
			{ triggerLabel }: { effect } { effectType }
		</span>
	);
};

function findTriggerLabel( propType: PropType, triggerValue = '' ): string {
	const arrayPropType = propType as ArrayPropType | undefined;
	const itemType = arrayPropType?.item_prop_type;

	if ( ! itemType || ! ( 'shape' in itemType ) ) {
		return triggerValue;
	}

	const triggerShape = itemType.shape?.trigger as { settings?: { enum?: TriggerOption[] } } | undefined;

	const triggerEnum = triggerShape?.settings?.enum ?? [];

	return triggerEnum.find( ( option ) => option.value === triggerValue )?.label ?? triggerValue;
}

const capitalize = ( value: string | null ): string | null => {
	if ( ! value ) {
		return null;
	}

	return value.charAt( 0 ).toUpperCase() + value.slice( 1 );
};
