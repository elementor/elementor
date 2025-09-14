import * as React from 'react';
import { InfoAlert } from '@elementor/editor-ui';
import { flushAllInjections } from '@elementor/locations/src/injections';
import { Alert, type AlertProps, AlertTitle, Box, Infotip, type InfotipProps, useTheme } from '@elementor/ui';
import { DirectionProvider } from '@elementor/ui';

import { getElementorFrontendConfig } from '../utils/get-elementor-globals';

export type Props = {
	infotipProps?: Partial< InfotipProps >;
	alertProps?: Partial< AlertProps >;
	title?: string;
	description?: string;
	isEnabled?: boolean;
};

const DEFAULT_SIZE = 'small';
const DEFAULT_COLOR = 'secondary';

export const ConditionalControlInfotip = ( {
	children,
	title,
	description,
	alertProps,
	infotipProps,
	...props
}: React.PropsWithChildren< Props > ) => {
	const theme = useTheme();
	const isUiRtl = 'rtl' === theme.direction;
	const isEnabled = props.isEnabled && ( title || description );

	return isEnabled ? (
		<DirectionProvider rtl={ isUiRtl }>
			<Infotip
				placement={ 'right' }
				arrow={ false }
				color={ DEFAULT_COLOR }

				slotProps={ {
					popper: {
						modifiers: [
							{
								name: 'offset',
								options: {
									offset: [ 0, 10 ],
								},
							},
						],
					},
				} }
				{ ...infotipProps }
				content={
					<InfoAlert color={ DEFAULT_COLOR } sx={ { width: 300, px: 1.5, py: 2 } } { ...alertProps }>
						<Box sx={ { flexDirection: 'column', display: 'flex' } }>
							<AlertTitle>{ title }</AlertTitle>
							<Box>{ description }</Box>
						</Box>
					</InfoAlert>
				}
			>
				{ children }
			</Infotip>
		</DirectionProvider>
	) : (
		children
	);
};
