import { getSelectedElements } from '@elementor/editor-elements';
import { getMixpanel } from '@elementor/events';

export type PromotionTrackingData = {
	target_name: string;
	target_location?: 'widget_panel' | 'variables_manager';
	location_l1?: string;
	location_l2?: 'style' | 'general' | 'interactions';
};

type MixpanelConfig = ReturnType< typeof getMixpanel >[ 'config' ];

const getBaseEventProperties = ( data: PromotionTrackingData, config: MixpanelConfig ) => ( {
	app_type: config?.appTypes?.editor ?? 'editor',
	window_name: config?.appTypes?.editor ?? 'editor',
	interaction_type: config?.triggers?.click ?? 'Click',
	target_name: data.target_name,
	target_location: data.target_location ?? 'widget_panel',
	location_l1: data.location_l1 ?? getSelectedElements()[ 0 ]?.type ?? '',
	...( data.location_l2 && { location_l2: data.location_l2 } ),
} );

export const trackViewPromotion = ( data: PromotionTrackingData ) => {
	const { dispatchEvent, config } = getMixpanel();
	const eventName = config?.names?.promotions?.viewPromotion;

	if ( ! eventName ) {
		return;
	}

	dispatchEvent?.( eventName, {
		...getBaseEventProperties( data, config ),
		interaction_result: config?.interactionResults?.promotionViewed ?? 'promotion_viewed',
		interaction_description: 'user_viewed_promotion',
	} );
};

export const trackUpgradePromotionClick = ( data: PromotionTrackingData ) => {
	const { dispatchEvent, config } = getMixpanel();
	const eventName = config?.names?.promotions?.upgradePromotionClick;

	if ( ! eventName ) {
		return;
	}

	dispatchEvent?.( eventName, {
		...getBaseEventProperties( data, config ),
		interaction_result: config?.interactionResults?.upgradeNow ?? 'upgrade_now',
		interaction_description: 'user_clicked_upgrade_now',
	} );
};
