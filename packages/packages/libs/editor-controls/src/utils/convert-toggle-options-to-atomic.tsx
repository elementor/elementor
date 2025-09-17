import * as React from 'react';
import type { ToggleButtonGroupItem } from '@elementor/editor-controls';
import * as Icons from '@elementor/icons';

export type DynamicToggleOption = {
	value: string;
	label: string;
	icon?: string;
	showTooltip?: boolean;
	exclusive?: boolean;
};

export const convertToggleOptionsToAtomic = (
	options: DynamicToggleOption[]
): Array< ToggleButtonGroupItem< string > & { exclusive?: boolean } > => {
	return options.map( ( option ) => {
		const iconName = option.icon;
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
