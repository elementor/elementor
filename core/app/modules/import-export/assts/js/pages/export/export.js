import Layout from '../../templates/layout';
import ExportContentList from './export-content-list/export-content-list';

import '../import-export.scss';
import './export.scss';

export default function Export() {
	return (
		<Layout type="export">
			<ExportContentList />
		</Layout>
	);
}

