import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { useElement } from '../contexts/element-context';
import { isHiddenByAncestor } from '../utils/ancestor-dependency-utils';

export function useIsHiddenByAncestor( bind: string ): boolean {
	const {
		element: { id: elementId },
		elementType: { propsSchema },
	} = useElement();

	const propType = propsSchema[ bind ];

	return useListenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'document/elements/set-settings' ),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/move' ),
		],
		() => isHiddenByAncestor( elementId, propType ),
		[ elementId, propType ]
	);
}
