import * as React from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import { Box, Collapse, IconButton, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useViolationFocus } from '../../hooks/use-violation-focus';
import { type AuditDescriptor, type AuditViolation } from '../../types';

type Props = {
	descriptor: AuditDescriptor;
	violations: AuditViolation[];
};

export default function ViolationRow( { descriptor, violations }: Props ) {
	const [ expanded, setExpanded ] = React.useState( false );
	const { focus } = useViolationFocus();

	return (
		<Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
			<Box
				sx={ { display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 1.5, cursor: 'pointer' } }
				onClick={ () => setExpanded( ( v ) => ! v ) }
			>
				<Typography variant="body2" sx={ { flex: 1 } }>
					{ descriptor.title }
				</Typography>
				<Typography variant="caption" color="text.secondary">
					{ violations.length }
				</Typography>
				<IconButton
					size="small"
					aria-label={ expanded ? __( 'Collapse', 'elementor' ) : __( 'Expand', 'elementor' ) }
				>
					<ChevronDownIcon
						sx={ {
							transform: expanded ? 'rotate(180deg)' : undefined,
							transition: 'transform .2s',
						} }
					/>
				</IconButton>
			</Box>
			<Collapse in={ expanded }>
				<Box sx={ { px: 2, py: 1, color: 'text.secondary' } }>
					<Typography variant="caption" component="p">
						{ descriptor.description }
					</Typography>
					<Typography variant="caption" component="p" sx={ { mt: 0.5 } }>
						{ descriptor.fixHint }
					</Typography>
				</Box>
				<Box role="list" sx={ { pb: 1 } }>
					{ violations.map( ( violation, idx ) => (
						<Box
							// eslint-disable-next-line react/no-array-index-key
							key={ idx }
							role="button"
							tabIndex={ 0 }
							onClick={ () => focus( violation ) }
							onKeyDown={ ( event ) => {
								if ( event.key === 'Enter' || event.key === ' ' ) {
									focus( violation );
								}
							} }
							sx={ {
								px: 2,
								py: 0.5,
								cursor: 'pointer',
								'&:hover': { bgcolor: 'action.hover' },
							} }
						>
							<Typography variant="caption">{ violation.label }</Typography>
						</Box>
					) ) }
				</Box>
			</Collapse>
		</Box>
	);
}
