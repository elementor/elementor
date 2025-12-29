import * as React from 'react';
import { useRef, useState } from 'react';
import { ComponentPropListIcon } from '@elementor/icons';
import { Link, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ComponentIntroduction } from '../components-tab/component-introduction';

const LEARN_MORE_URL = 'https://go.elementor.com/tbd/';

export function PropertiesEmptyState() {
	const [ isOpen, setIsOpen ] = useState( false );
	const anchorRef = useRef< HTMLDivElement >( null );
	return (
		<>
			<Stack
				alignItems="center"
				justifyContent="flex-start"
				height="100%"
				color="text.secondary"
				sx={ { px: 2.5, pt: 10, pb: 5.5 } }
				gap={ 1 }
				ref={ anchorRef }
			>
				<ComponentPropListIcon fontSize="large" />

				<Typography align="center" variant="subtitle2">
					{ __( 'Add your first property', 'elementor' ) }
				</Typography>

				<Typography align="center" variant="caption">
					{ __( 'Make instances flexible while keeping design synced.', 'elementor' ) }
				</Typography>

				<Typography align="center" variant="caption">
					{ __( 'Select any element, then click + next to a setting to expose it.', 'elementor' ) }
				</Typography>

				<Link
					variant="caption"
					color="secondary"
					sx={ { textDecorationLine: 'underline' } }
					onClick={ () => setIsOpen( true ) }
				>
					{ __( 'Learn more', 'elementor' ) }
				</Link>
			</Stack>
			<ComponentIntroduction
				anchorRef={ anchorRef }
				shouldShowIntroduction={ isOpen }
				onClose={ () => setIsOpen( false ) }
			/>
		</>
	);
}
