import { useContext } from 'react';

import { Context } from '../../context/export/export-context';

import Layout from '../../templates/layout';
import ExportKit from './export-kit/export-kit';
import ExportComplete from './export-complete/export-complete';

export default function ExportEntry() {
	const exportContext = useContext( Context ),
		exportCompleteImageUrl = elementorAppConfig.assets_url + 'images/go-pro.svg';

	// The exportCompleteImageUrl should be preloaded because safari blocks external requests while downloading the file.
	return (
		<Layout type="export">
			<section className="e-app-export">
				<link rel="preload" as="image" href={ exportCompleteImageUrl } />
				{
					exportContext.data.downloadURL ?
						<ExportComplete imageUrl={ exportCompleteImageUrl } /> : <ExportKit />
				}
			</section>
		</Layout>
	);
}
