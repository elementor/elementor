import { __getState as getState } from '@elementor/store';

import { selectOverridableProps } from '../../../store/store';
import { type OverridableProp } from '../../../types';

export function getOverridableProp( {
	componentId,
	overrideKey,
}: {
	componentId: number;
	overrideKey: string;
} ): OverridableProp | undefined {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return undefined;
	}

	return overridableProps.props[ overrideKey ];
}
