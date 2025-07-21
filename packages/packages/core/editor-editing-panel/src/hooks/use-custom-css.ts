import { useMemo } from 'react';
import {
	createElementStyle,
	deleteElementStyle,
	type ElementID,
	shouldCreateNewLocalStyle,
} from '@elementor/editor-elements';
import { stringPropTypeUtil } from '@elementor/editor-props';
import {
	type CustomCss,
	getVariantByMeta,
	type StyleDefinition,
	type StyleDefinitionVariant,
} from '@elementor/editor-styles';
import { ELEMENTS_STYLES_RESERVED_LABEL, type StylesProvider } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';
import { decodeString, encodeString } from '@elementor/utils';

import { useClassesProp } from '../contexts/classes-prop-context';
import { useElement } from '../contexts/element-context';
import { useStyle } from '../contexts/style-context';
import { StylesProviderCannotUpdatePropsError } from '../errors';
import { getSubtitle, getTitle, HISTORY_DEBOUNCE_WAIT } from './use-styles-fields';
import { useStylesRerender } from './use-styles-rerender';

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

export const useCustomCss = () => {
	const {
		element: { id: elementId },
	} = useElement();
	const { id: styleId, meta, provider } = useStyle();
	const style = provider?.actions.get( styleId, { elementId } );
	const undoableUpdateStyle = useUndoableActions( { elementId, meta } );

	const currentStyleId = styleId ? styleId : null;
	const currentProvider = styleId ? provider : null;

	useStylesRerender();

	const variant = style ? getVariantByMeta( style, meta ) : null;

	const setCustomCss = (
		raw: string,
		{ history: { propDisplayName } }: { history: { propDisplayName: string } }
	) => {
		const newValue = { raw: encodeString( sanitize( raw ) ) };

		undoableUpdateStyle( {
			styleId: currentStyleId,
			provider: currentProvider,
			customCss: newValue,
			propDisplayName,
		} as UndoableUpdateStylePayload );
	};

	const customCss = variant?.custom_css?.raw ? { raw: decodeString( variant.custom_css.raw ) } : null;

	return {
		customCss,
		setCustomCss,
	};
};

function useUndoableActions( {
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
					if ( shouldCreateNewLocalStyle< StylesProvider >( payload ) ) {
						return create( payload as CreateStyleArgs );
					}
					return update( payload as UpdateStyleArgs );
				},
				undo: ( payload: UndoableUpdateStylePayload, doReturn: UndoableUpdateStyleReturn ) => {
					if ( shouldCreateNewLocalStyle< StylesProvider >( payload ) ) {
						return undoCreate( payload as CreateStyleArgs, doReturn as CreateStyleReturn );
					}
					return undoUpdate( payload as UpdateStyleArgs, doReturn as UpdateStyleReturn );
				},
				redo: ( payload: UndoableUpdateStylePayload, doReturn: UndoableUpdateStyleReturn ) => {
					if ( shouldCreateNewLocalStyle< StylesProvider >( payload ) ) {
						return create( payload as CreateStyleArgs, doReturn as CreateStyleReturn );
					}
					return update( payload as UpdateStyleArgs );
				},
			},
			{
				title: ( { provider, styleId } ) => getTitle( { provider, styleId, elementId } ),
				subtitle: ( { provider, styleId, propDisplayName } ) =>
					getSubtitle( { provider, styleId, elementId, propDisplayName } ),
				debounce: { wait: HISTORY_DEBOUNCE_WAIT },
			}
		);

		function create( { customCss }: CreateStyleArgs, redoArgs?: CreateStyleReturn ): CreateStyleReturn {
			const createdStyle = createElementStyle( {
				...createStyleArgs,
				props: {},
				custom_css: customCss ?? null,
				styleId: redoArgs?.createdStyleId,
			} );

			return { createdStyleId: createdStyle };
		}

		function undoCreate( _: UndoableUpdateStylePayload, { createdStyleId }: CreateStyleReturn ) {
			deleteElementStyle( elementId, createdStyleId );
		}

		function update( { provider, styleId, customCss }: UpdateStyleArgs ): UpdateStyleReturn {
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

		function undoUpdate( _: UndoableUpdateStylePayload, { styleId, provider, prevCustomCss }: UpdateStyleReturn ) {
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
