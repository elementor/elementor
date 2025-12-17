import { htmlPropTypeUtil } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { createReplacementBridge } from '../../../legacy/create-replacement-bridge';
import { type CreateTemplatedElementTypeOptions } from '../../../legacy/create-templated-element-type';
import { getPreviewOffset, getViewTag, isValueDynamic, syncViewSetting } from '../../../utils/view';
import { deactivate, type ViewReplacementConfig } from '../../registry';

const EXPERIMENT_KEY = 'v4-inline-text-editing';

const createInlineEditingConfig = ( propName: string ): ViewReplacementConfig => ( {
	shouldReplace: () => isExperimentActive( EXPERIMENT_KEY ),
	createView: ( { type, renderer, element }: CreateTemplatedElementTypeOptions ) =>
		createReplacementBridge(
			{
				type: 'inline-editing',
				shouldActivate: ( view ) => ! isValueDynamic( view, propName ),
				activationTrigger: 'dblclick',
				onActivate: ( view ) => {
					syncViewSetting( view, propName, htmlPropTypeUtil, ( value ) => value ?? '' );
				},
				getProps: ( view ) => {
					const settingValue = view.model.get( 'settings' )?.get( propName );
					const initialValue = htmlPropTypeUtil.extract( settingValue ) ?? '';

					return {
						propName,
						initialValue,
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
					};
				},
			},
			{ type, renderer, element }
		),
} );

export const inlineEditingReplacements = [
	{ widgetType: 'e-heading', config: createInlineEditingConfig( 'title' ) },
	{ widgetType: 'e-paragraph', config: createInlineEditingConfig( 'paragraph' ) },
];

