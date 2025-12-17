import { createReplacementBridge } from './create-replacement-bridge';
import { type CreateTemplatedElementTypeOptions } from './create-templated-element-type';
import { inlineEditingBridgeConfig } from './inline-editing-bridge-config';
import { type ElementType, type LegacyWindow } from './types';

const legacyWindow = window as unknown as LegacyWindow;

export function createInlineEditingElementType( {
	type,
	renderer,
	element,
}: CreateTemplatedElementTypeOptions ): typeof ElementType {
	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return createInlineEditingElementView( {
				type,
				renderer,
				element,
			} );
		}
	};
}

export function createInlineEditingElementView(
	options: CreateTemplatedElementTypeOptions
): ReturnType<typeof createReplacementBridge> {
	return createReplacementBridge( inlineEditingBridgeConfig, options );
}
