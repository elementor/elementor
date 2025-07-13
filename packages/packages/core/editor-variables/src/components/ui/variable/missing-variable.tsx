import * as React from 'react';
import { useState } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { Backdrop, Infotip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { MissingVariableAlert } from '../missing-variable-alert';
import { MissingTag } from '../tags/missing-tag';

export const MissingVariable = () => {
	const { setValue } = useBoundProp();

	const [ showInfotip, setShowInfotip ] = useState< boolean >( false );
	const toggleInfotip = () => setShowInfotip( ( prev ) => ! prev );
	const closeInfotip = () => setShowInfotip( false );

	const clearValue = () => {
		setValue( null );
	};

	return (
		<>
			{ showInfotip && <Backdrop open onClick={ closeInfotip } invisible /> }
			<Infotip
				color="warning"
				placement="right-start"
				open={ showInfotip }
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
