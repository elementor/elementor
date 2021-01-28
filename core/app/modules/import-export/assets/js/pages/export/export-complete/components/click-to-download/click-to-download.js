import { useContext } from 'react';

import { Context } from '../../../../../context/export/export-context';

import ClickHere from '../../../../../ui/click-here/click-here';

export default function ClickToDownload() {
	const exportContext = useContext( Context );

	return (
		<ClickHere url={ exportContext.data.downloadURL } target="_self" />
	);
}
