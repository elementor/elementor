import * as React from 'react';
import * as Icons from '@elementor/icons';
import type { ToggleButtonGroupItem } from '@elementor/editor-controls';

export type DynamicToggleOption = {
	value: string;
	label: string;
	icon?: string;
	'atomic-icon'?: string;
	showTooltip?: boolean;
	exclusive?: boolean;
};

export const convertToggleOptionsToAtomic = (
	options: DynamicToggleOption[]
): Array< ToggleButtonGroupItem< string > & { exclusive?: boolean } > => {
	return options.map( ( option ) => {
		const iconName = option[ 'atomic-icon' ];
		const IconComponent = Icons[ iconName as keyof typeof Icons ];

		return {
			value: option.value,
			label: option.label,
			renderContent: ( { size } ) => {
				if ( IconComponent ) {
					return <IconComponent fontSize={ size } />;
				}
				return option.label;
			},
			showTooltip: option.showTooltip,
			exclusive: option.exclusive,
		};
	} );
};
