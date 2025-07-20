import { useMemo } from 'react';
import { createElementStyle, deleteElementStyle, type ElementID } from '@elementor/editor-elements';
import { stringPropTypeUtil } from '@elementor/editor-props';
import {
	type CustomCss,
	getVariantByMeta,
	type StyleDefinition,
	type StyleDefinitionVariant,
} from '@elementor/editor-styles';
import { ELEMENTS_STYLES_RESERVED_LABEL, type StylesProvider } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';

import { useClassesProp } from '../contexts/classes-prop-context';
import { useElement } from '../contexts/element-context';
import { useStyle } from '../contexts/style-context';
import { StylesProviderCannotUpdatePropsError } from '../errors';
import { getSubtitle, getTitle, HISTORY_DEBOUNCE_WAIT } from './use-styles-fields';
import { useStylesRerender } from './use-styles-rerender';

export const useCustomCss = () => {
	const {
		element: { id: elementId },
	} = useElement();
	const { id: styleId, meta, provider } = useStyle();
	const style = provider?.actions.get( styleId, { elementId } );
	const undoableUpdateStyle = useUndoableUpdateCustomCss( { elementId, meta } );

	useStylesRerender();

	const variant = style ? getVariantByMeta( style, meta ) : null;
	const customCss = variant?.custom_css?.raw ? variant?.custom_css : null;

	const setCustomCss = (
		raw: string,
		{ history: { propDisplayName } }: { history: { propDisplayName: string } }
	) => {
		const newValue = { raw: sanitize( raw ) };

		if ( ! styleId ) {
			undoableUpdateStyle( { styleId: null, provider: null, customCss: newValue, propDisplayName } );
		} else {
			undoableUpdateStyle( { styleId, provider, customCss: newValue, propDisplayName } );
		}
	};

	return {
		customCss,
		setCustomCss,
	};
};

type UpdateStyleArgs = {
	styleId: StyleDefinition[ 'id' ];
	provider: StylesProvider;
	customCss: CustomCss;
	propDisplayName: string;
};

type CreateStyleArgs = {
	styleId: null;
	provider: null;
	customCss: CustomCss | null;
	propDisplayName: string;
};

type UpdateStyleReturn = {
	styleId: StyleDefinition[ 'id' ];
	provider: StylesProvider;
	prevCustomCss: CustomCss | null;
};

type CreateStyleReturn = {
	createdStyleId: StyleDefinition[ 'id' ];
};

type UndoableUpdateStylePayload = UpdateStyleArgs | CreateStyleArgs;
type UndoableUpdateStyleReturn = UpdateStyleReturn | CreateStyleReturn;

export function useUndoableUpdateCustomCss( {
	elementId,
	meta: { breakpoint, state },
}: {
	elementId: ElementID;
	meta: StyleDefinitionVariant[ 'meta' ];
} ) {
	const classesProp = useClassesProp();

	return useMemo( () => {
		const meta = { breakpoint, state };

		const createStyleArgs = { elementId, classesProp, meta, label: ELEMENTS_STYLES_RESERVED_LABEL };

		return undoable(
			{
				do: ( payload: UndoableUpdateStylePayload ): UndoableUpdateStyleReturn => {
					if ( shouldCreateNewLocalStyle( payload ) ) {
						return createLocalStyle( payload as CreateStyleArgs );
					}
					return updateStyleCustomCss( payload as UpdateStyleArgs );
				},
				undo: ( payload: UndoableUpdateStylePayload, doReturn: UndoableUpdateStyleReturn ) => {
					const wasLocalStyleCreated = shouldCreateNewLocalStyle( payload );

					if ( wasLocalStyleCreated ) {
						return undoCreateLocalStyle( payload as CreateStyleArgs, doReturn as CreateStyleReturn );
					}
					return undoUpdateStyleCustomCss( payload as UpdateStyleArgs, doReturn as UpdateStyleReturn );
				},
				redo: ( payload: UndoableUpdateStylePayload, doReturn: UndoableUpdateStyleReturn ) => {
					const wasLocalStyleCreated = shouldCreateNewLocalStyle( payload );

					if ( wasLocalStyleCreated ) {
						return createLocalStyle( payload as CreateStyleArgs, doReturn as CreateStyleReturn );
					}
					return updateStyleCustomCss( payload as UpdateStyleArgs );
				},
			},
			{
				title: ( { provider, styleId } ) => getTitle( { provider, styleId, elementId } ),
				subtitle: ( { provider, styleId, propDisplayName } ) =>
					getSubtitle( { provider, styleId, elementId, propDisplayName } ),
				debounce: { wait: HISTORY_DEBOUNCE_WAIT },
			}
		);

		function shouldCreateNewLocalStyle( payload: UndoableUpdateStylePayload ) {
			return ! payload.styleId && ! payload.provider;
		}

		function createLocalStyle( { customCss }: CreateStyleArgs, redoArgs?: CreateStyleReturn ): CreateStyleReturn {
			const createdStyle = createElementStyle( {
				...createStyleArgs,
				props: {},
				custom_css: customCss ?? null,
				styleId: redoArgs?.createdStyleId,
			} );

			return { createdStyleId: createdStyle };
		}

		function undoCreateLocalStyle( _: UndoableUpdateStylePayload, { createdStyleId }: CreateStyleReturn ) {
			deleteElementStyle( elementId, createdStyleId );
		}

		function updateStyleCustomCss( { provider, styleId, customCss }: UpdateStyleArgs ): UpdateStyleReturn {
			if ( ! provider.actions.updateCustomCss ) {
				throw new StylesProviderCannotUpdatePropsError( {
					context: { providerKey: provider.getKey() },
				} );
			}

			const style = provider.actions.get( styleId, { elementId } );
			const prevCustomCss = getCurrentCustomCss( style, meta );

			provider.actions.updateCustomCss( { id: styleId, meta, custom_css: customCss }, { elementId } );

			return { styleId, provider, prevCustomCss };
		}

		function undoUpdateStyleCustomCss(
			_: UndoableUpdateStylePayload,
			{ styleId, provider, prevCustomCss }: UpdateStyleReturn
		) {
			provider.actions.updateCustomCss?.(
				{ id: styleId, meta, custom_css: prevCustomCss ?? { raw: '' } },
				{ elementId }
			);
		}
	}, [ elementId, breakpoint, state, classesProp ] );
}

function getCurrentCustomCss( style: StyleDefinition | null, meta: StyleDefinitionVariant[ 'meta' ] ) {
	if ( ! style ) {
		return null;
	}

	const variant = getVariantByMeta( style, meta );

	return variant?.custom_css ?? null;
}

function sanitize( raw: string ) {
	return stringPropTypeUtil.schema.safeParse( stringPropTypeUtil.create( raw ) ).data?.value?.trim() ?? '';
}
