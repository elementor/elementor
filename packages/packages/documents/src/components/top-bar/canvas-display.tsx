import { useMemo } from 'react';
import { Grid } from '@elementor/ui';
import { useActiveDocument } from '../../hooks';
import useHostDocument from '../../hooks/use-host-document';
import SettingsButton from './settings-button';
import Indicator from './indicator';

export default function CanvasDisplay() {
	const activeDocument = useActiveDocument();
	const hostDocument = useHostDocument();

	const document = useMemo( () => {
		if ( activeDocument && activeDocument.type !== 'kit' ) {
			return activeDocument;
		}

		if ( hostDocument ) {
			return hostDocument;
		}

		return null;
	}, [ activeDocument, hostDocument ] );

	if ( ! document ) {
		return null;
	}

	return (
		<Grid container alignItems="center" flexWrap="noWrap" sx={ { px: 3, gap: 3 } }>
			<Indicator title={ document.title } status={ document.status } />
			<SettingsButton />
		</Grid>
	);
}
