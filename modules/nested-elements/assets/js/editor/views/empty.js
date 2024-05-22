import { useState } from 'react';

import AddSectionArea from './add-section-area';
import SelectPreset from './select-preset';

export default function Empty( props ) {
	const [ isRenderPresets, setIsRenderPresets ] = useState( false );

	props = {
		...props,
		setIsRenderPresets,
	};

	return isRenderPresets ? <SelectPreset { ...props } /> : <AddSectionArea { ...props } />;
}

Empty.propTypes = {
	container: PropTypes.object.isRequired,
};

