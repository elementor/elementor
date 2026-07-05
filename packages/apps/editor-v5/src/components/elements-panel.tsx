import * as React from 'react';
import { createElement, getAtomicCatalog } from '@elementor/editor-v5-store';
import { __dispatch as dispatch } from '@elementor/store';
import { List, ListItemButton, ListItemText, Typography } from '@elementor/ui';

export default function ElementsPanel() {
	const widgets = React.useMemo( () => getAtomicCatalog(), [] );

	const handleAdd = ( name: string, elType?: string ) => {
		const isWidget = elType === 'widget';

		dispatch(
			createElement( {
				elType: isWidget ? 'widget' : name,
				widgetType: isWidget ? name : undefined,
			} )
		);
	};

	return (
		<>
			<Typography sx={ { p: 2, pb: 1 } } variant="subtitle2">
				Atomic Elements
			</Typography>
			<List dense>
				{ widgets.map( ( widget ) => (
					<ListItemButton
						key={ widget.name }
						onClick={ () => handleAdd( widget.name, widget.elType as string | undefined ) }
					>
						<ListItemText primary={ widget.title || widget.name } secondary={ widget.name } />
					</ListItemButton>
				) ) }
			</List>
		</>
	);
}
