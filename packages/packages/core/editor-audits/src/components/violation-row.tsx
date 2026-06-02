import * as React from 'react';
import { useState } from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import { Box, Collapse, IconButton, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useViolationFocus } from '../hooks/use-violation-focus';
import { type AuditDescriptor, type AuditViolation } from '../types';
import SeverityIcon from './severity-icons';

type Props = {
	descriptor: AuditDescriptor;
	violations: AuditViolation[];
};

export default function ViolationRow( { descriptor, violations }: Props ) {
	const [ expanded, setExpanded ] = useState( false );
	const { focus } = useViolationFocus();

	return (
		<Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
			<Box
				sx={ { display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' } }
				onClick={ () => setExpanded( ( v ) => ! v ) }
			>
				<IconButton
					size="small"
					aria-label={ expanded ? __( 'Collapse', 'elementor' ) : __( 'Expand', 'elementor' ) }
				>
					<ChevronDownIcon
						fontSize="small"
						sx={ {
							transform: expanded ? 'rotate(180deg)' : undefined,
							transition: 'transform .2s',
						} }
					/>
				</IconButton>
				<Typography variant="body2" sx={ { flex: 1 } }>
					{ descriptor.title }
				</Typography>
				<Typography variant="caption" color="text.secondary">
					{ violations.length }
				</Typography>
				<SeverityIcon severity={ descriptor.severity } />
			</Box>
			<Collapse in={ expanded }>
				<Box
					sx={ { paddingInlineStart: 4, paddingBlock: 1, display: 'flex', flexDirection: 'column', gap: 1 } }
				>
					<Box sx={ { bgcolor: 'action.hover', borderRadius: 1, p: 1 } }>
						<Typography variant="caption" component="p" fontWeight="bold">
							{ __( "What's the issue", 'elementor' ) }
						</Typography>
						<Typography variant="caption" component="p" color="text.secondary">
							{ descriptor.description }
						</Typography>
					</Box>
					<Box sx={ { bgcolor: 'action.hover', borderRadius: 1, p: 1 } }>
						<Typography variant="caption" component="p" fontWeight="bold">
							{ __( 'How to resolve', 'elementor' ) }
						</Typography>
						<Typography variant="caption" component="p" color="text.secondary">
							{ descriptor.fixHint }
						</Typography>
					</Box>
				</Box>
				<Box role="list" sx={ { paddingBlockEnd: 1, paddingInlineStart: 4 } }>
					{ violations.map( ( violation, idx ) => (
						<Box
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
								paddingBlock: 0.5,
								paddingInline: 2,
								borderRadius: 1,
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
