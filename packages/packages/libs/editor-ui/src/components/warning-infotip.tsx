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
}

export const WarningInfotip = forwardRef(
	( { children, open, title, text, placement, width, offset }: WarningInfotipProps, ref: unknown ) => {
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
					<Alert color="error" severity="warning" variant="standard" size="small">
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
