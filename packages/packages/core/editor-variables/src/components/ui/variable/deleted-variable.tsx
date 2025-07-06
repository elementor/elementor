import * as React from 'react';
import { useState } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type PropTypeUtil } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Backdrop, Infotip } from '@elementor/ui';

import { restoreVariable } from '../../../hooks/use-prop-variables';
import { type Variable } from '../../../types';
import { DeletedVariableAlert } from '../deleted-variable-alert';
import { DeletedTag } from '../tags/deleted-tag';

const isV331Active = isExperimentActive( 'e_v_3_31' );

type Props = {
	variable: Variable;
	variablePropTypeUtil: PropTypeUtil< string, string >;
	fallbackPropTypeUtil: PropTypeUtil< string, string | null > | PropTypeUtil< string, string >;
};

export const DeletedVariable = ( { variable, variablePropTypeUtil, fallbackPropTypeUtil }: Props ) => {
	const { setValue } = useBoundProp();
	const [ showInfotip, setShowInfotip ] = useState< boolean >( false );

	const toggleInfotip = () => setShowInfotip( ( prev ) => ! prev );

	const closeInfotip = () => setShowInfotip( false );

	const unlinkVariable = () => {
		setValue( fallbackPropTypeUtil.create( variable.value ) );
	};

	const handleRestore = () => {
		if ( ! variable.key ) {
			return;
		}

		restoreVariable( variable.key ).then( ( key ) => {
			setValue( variablePropTypeUtil.create( key ) );
			closeInfotip();
		} );
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
				content={
					<DeletedVariableAlert
						onClose={ closeInfotip }
						onUnlink={ unlinkVariable }
						onRestore={ isV331Active ? handleRestore : undefined }
						label={ variable.label }
					/>
				}
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
				<DeletedTag label={ variable.label } onClick={ toggleInfotip } />
			</Infotip>
		</>
	);
};
