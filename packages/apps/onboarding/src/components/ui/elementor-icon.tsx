import * as React from 'react';
import { SvgIcon, type SvgIconProps } from '@elementor/ui';

/**
 * Elementor "E" logo icon.
 * Uses currentColor by default, so it inherits color from parent or theme.
 * @param props
 */
export function ElementorIcon( props: SvgIconProps ) {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props }>
			<path
				d="M15.93 0C7.13 0 0 7.16 0 16s7.13 16 15.93 16c8.8 0 15.93-7.16 15.93-16S24.73 0 15.93 0zM11.15 24H7.97V8h3.18v16zm12.74 0h-9.56v-3.2h9.56V24zm0-6.4h-9.56v-3.2h9.56v3.2zm0-6.4h-9.56V8h9.56v3.2z"
				fill="currentColor"
			/>
		</SvgIcon>
	);
}
