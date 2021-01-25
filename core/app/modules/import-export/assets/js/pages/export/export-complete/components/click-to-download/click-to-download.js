import { useContext } from 'react';

import { Context as KitContext } from '../../../../../context/kit-context';

import ClickHere from '../../../../../ui/click-here/click-here';

export default function ClickToDownload() {
	const context = useContext( KitContext );

	return (
		<ClickHere url={ context.kitContent.downloadURL } />
	);
}
