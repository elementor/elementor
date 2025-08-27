import * as React from 'react';
import { useState } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { Backdrop, Infotip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { MissingVariableAlert } from '../missing-variable-alert';
import { MissingTag } from '../tags/missing-tag';

export const MissingVariable = () => {
	const { setValue } = useBoundProp();

	const [ infotipVisible, setInfotipVisible ] = useState< boolean >( false );
	const toggleInfotip = () => setInfotipVisible( ( prev ) => ! prev );
	const closeInfotip = () => setInfotipVisible( false );

	const clearValue = () => setValue( null );

	return (
		<>
			{ infotipVisible && <Backdrop open onClick={ closeInfotip } invisible /> }
			<Infotip
				color="warning"
				placement="right-start"
				open={ infotipVisible }
				disableHoverListener
				onClose={ closeInfotip }
				content={ <MissingVariableAlert onClose={ closeInfotip } onClear={ clearValue } /> }
				slotProps={ {
					popper: {
						modifiers: [
							{
								name: 'offset',
								options: { offset: [ 0, 24 ] },
							},
						],
					},
				} }
			>
				<MissingTag label={ __( 'Missing variable', 'elementor' ) } onClick={ toggleInfotip } />
			</Infotip>
		</>
	);
};
