import { type Props } from '@elementor/editor-props';
import { type StyleDefinitionState } from '@elementor/editor-styles';

import { createElementStyle } from '../../styles/create-element-style';
import { resolveBreakpointId } from './common-style-utils';

export function handleCreateStyle( {
	elementId,
	styleId,
	classesProp = 'classes',
	label = 'local',
	styles,
	breakpoint = 'desktop',
	state = null,
	customCss = null,
}: {
	elementId: string;
	styleId?: string;
	classesProp?: string;
	label?: string;
	styles: Props;
	breakpoint?: string | null;
	state?: string | null;
	customCss?: { raw: string } | null;
} ): { styleId: string } {
	const resolvedBreakpoint = resolveBreakpointId( breakpoint );

	const resolvedState: StyleDefinitionState =
		state === null || state === undefined ? null : ( state as StyleDefinitionState );

	const createdStyleId = createElementStyle( {
		styleId: styleId as string | undefined,
		elementId,
		classesProp,
		label,
		meta: { breakpoint: resolvedBreakpoint, state: resolvedState },
		props: styles,
		custom_css: customCss,
	} );

	return { styleId: createdStyleId };
}
