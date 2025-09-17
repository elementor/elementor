import * as React from 'react';
import { InfoAlert } from '@elementor/editor-ui';
import { type AlertProps, AlertTitle, Box, Infotip, type InfotipProps, useTheme } from '@elementor/ui';
import { DirectionProvider } from '@elementor/ui';

type Props = {
	infotipProps?: Partial< InfotipProps >;
	alertProps?: Partial< AlertProps >;
	title?: string;
	description?: React.ReactNode | string;
	isEnabled?: boolean;
};

const DEFAULT_COLOR = 'secondary';

export const ConditionalControlInfotip = React.forwardRef(
	( { children, title, description, alertProps, infotipProps, ...props }: React.PropsWithChildren< Props >, ref ) => {
		const theme = useTheme();
		const isUiRtl = 'rtl' === theme.direction;
		const isEnabled = props.isEnabled && ( title || description );

		return (
			<Box ref={ ref }>
				{ isEnabled ? (
					<DirectionProvider rtl={ isUiRtl }>
						<Infotip
							placement={ 'right' }
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
								<InfoAlert
									color={ DEFAULT_COLOR }
									sx={ { width: 300, px: 1.5, py: 2 } }
									{ ...alertProps }
								>
									<Box sx={ { flexDirection: 'column', display: 'flex', gap: 0.5 } }>
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
				) }
			</Box>
		);
	}
);
