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

const dispatchPromotionEvent = (
	data: PromotionTrackingData,
	resolveOptions: ( config: MixpanelConfig ) => {
		eventName: string | undefined;
		interactionResult: string;
		interactionDescription: string;
	},
) => {
	const { dispatchEvent, config } = getMixpanel();
	const { eventName, interactionResult, interactionDescription } = resolveOptions( config );

	if ( ! eventName ) {
		return;
	}

	dispatchEvent?.( eventName, {
		...getBaseEventProperties( data, config ),
		interaction_result: interactionResult,
		interaction_description: interactionDescription,
	} );
};

export const trackViewPromotion = ( data: PromotionTrackingData ) => {
	dispatchPromotionEvent( data, ( config ) => ( {
		eventName: config?.names?.promotions?.viewPromotion,
		interactionResult: config?.interactionResults?.promotionViewed ?? 'promotion_viewed',
		interactionDescription: 'user_viewed_promotion',
	} ) );
};

export const trackUpgradePromotionClick = ( data: PromotionTrackingData ) => {
	dispatchPromotionEvent( data, ( config ) => ( {
		eventName: config?.names?.promotions?.upgradePromotionClick,
		interactionResult: config?.interactionResults?.upgradeNow ?? 'upgrade_now',
		interactionDescription: 'user_clicked_upgrade_now',
	} ) );
};
