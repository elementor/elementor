import { forwardRef, type PropsWithChildren } from 'react';
import * as React from 'react';
import { Alert, AlertTitle, Infotip, type InfotipProps } from '@elementor/ui';

interface WarningInfotipProps extends PropsWithChildren {
	open: boolean;
	title?: string;
	text: string;
	placement: InfotipProps[ 'placement' ];
	width?: string | number;
	offset?: number[];
	hasError?: boolean;
}

export const WarningInfotip = forwardRef(
	( { children, open, title, text, placement, width, offset, hasError = true }: WarningInfotipProps, ref: unknown ) => {
		return (
			<Infotip
				ref={ ref }
				open={ open }
				placement={ placement }
				PopperProps={ {
					sx: {
						width: width ? width : 'initial',
						'.MuiTooltip-tooltip': { marginLeft: 0, marginRight: 0 },
					},
					modifiers: offset ? [ { name: 'offset', options: { offset } } ] : [],
				} }
				arrow={ false }
				content={
					<Alert 
						color={ hasError ? 'error' : 'secondary' }
						severity="warning"
						variant="standard" 
						size="small"
					>
						{ title ? <AlertTitle>{ title }</AlertTitle> : null }
						{ text }
					</Alert>
				}
			>
				{ children }
			</Infotip>
		);
	}
);
