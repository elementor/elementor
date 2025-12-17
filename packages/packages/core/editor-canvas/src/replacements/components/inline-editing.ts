import { htmlPropTypeUtil } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { createReplacementBridge } from '../../legacy/create-replacement-bridge';
import { type CreateTemplatedElementTypeOptions } from '../../legacy/create-templated-element-type';
import { type ElementView } from '../../legacy/types';
import {
	getBlockedValue,
	getInlineEditablePropertyName,
	INLINE_EDITING_WIDGET_PROPERTY_MAP,
} from '../../utils/inline-editing-utils';
import { getPreviewOffset, getViewTag, isValueDynamic, syncViewSetting } from '../../utils/view';
import { deactivate, type ViewReplacementConfig } from '../registry';

const EXPERIMENT_KEY = 'v4-inline-text-editing';
const INLINE_EDITING_WIDGETS = Object.keys( INLINE_EDITING_WIDGET_PROPERTY_MAP );

const ensureProperValue = ( view: ElementView ) => {
	const settingKey = getInlineEditablePropertyName( view.container );
	syncViewSetting( view, settingKey, htmlPropTypeUtil, ( value ) =>
		value ?? ''
	);
};

export const inlineEditingReplacement = {
	widgetTypes: INLINE_EDITING_WIDGETS,
	config: {
		shouldReplace: () => isExperimentActive( EXPERIMENT_KEY ),
		createView: ( { type, renderer, element }: CreateTemplatedElementTypeOptions ) =>
			createReplacementBridge(
				{
					type: 'inline-editing',
					shouldActivate: ( view ) => {
						const settingKey = getInlineEditablePropertyName( view.container );
						return ! isValueDynamic( view, settingKey );
					},
					activationTrigger: 'dblclick',
					onActivate: ( view ) => ensureProperValue( view ),
					getProps: ( view ) => ( {
						classes: ( view.el?.children?.[ 0 ]?.classList.toString() ?? '' ) + ' strip-styles',
						expectedTag: getViewTag( view ),
						toolbarOffset: getPreviewOffset(),
						onComplete: () => {
							const elementId = view.container?.id ?? view.model?.get?.( 'id' );
							if ( elementId ) {
								deactivate( elementId );
							}

							view.render();
						},
					} ),
				},
				{ type, renderer, element }
			),
	} as ViewReplacementConfig,
};

