import * as React from 'react';
import { useState } from 'react';
import { getElementIcon, getElementTitle } from '@elementor/editor-elements';
import { CheckIcon, ChevronDownIcon, EyeIcon, FileSettingsIcon, SettingsIcon } from '@elementor/icons';
import { Box, Collapse, IconButton, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useViolationFocus } from '../hooks/use-violation-focus';
import { type AuditDescriptor, type AuditViolation } from '../types';
import SeverityIcon from './severity-icons';

type Props = {
	descriptor: AuditDescriptor;
	violations?: AuditViolation[];
};

export default function ViolationRow( { descriptor, violations }: Props ) {
	const [ expanded, setExpanded ] = useState( false );
	const { focus } = useViolationFocus();

	return (
		<Box sx={ { borderBottom: 1, borderColor: 'divider', paddingBlock: 0.5 } }>
			<Box
				sx={ { display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' } }
				onClick={ () => setExpanded( ( v ) => ! v ) }
			>
				<Typography variant="body2" sx={ { flex: 1 } }>
					{ descriptor.title }
				</Typography>
				{ violations ? (
					<>
						<Typography variant="caption" color="text.secondary" fontWeight="bold">
							{ violations.length }
						</Typography>
						<SeverityIcon severity={ descriptor.severity } />
					</>
				) : (
					<CheckIcon fontSize="small" color="success" />
				) }
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
			</Box>
			<Collapse in={ expanded }>
				<Box sx={ { display: 'flex', flexDirection: 'column', gap: 1, paddingBlock: 1 } }>
					<Box sx={ { bgcolor: 'action.hover', borderRadius: 1, p: 1 } }>
						<Typography variant="caption" component="p" fontWeight="bold">
							{ __( "What's the issue", 'elementor' ) }
						</Typography>
						<Typography variant="caption" component="p" color="text.secondary">
							{ descriptor.description }
						</Typography>
					</Box>
					<Box sx={ { bgcolor: '#EFF5FE', borderRadius: 1, p: 1 } }>
						<Typography variant="caption" component="p" fontWeight="bold">
							{ __( 'How to resolve', 'elementor' ) }
						</Typography>
						<Typography variant="caption" component="p" color="text.secondary">
							{ descriptor.fixHint }
						</Typography>
					</Box>
				</Box>
				{ violations && violations.length > 0 && (
					<Box role="list" sx={ { paddingBlockEnd: 1, paddingInlineStart: 2 } }>
					{ violations.map( ( violation, idx ) => {
						const widgetIcon = violation.elementId ? getElementIcon( violation.elementId ) : null;

						return (
							<Box
								key={ idx }
								role="button"
								tabIndex={ 0 }
								onClick={ () => focus( violation ) }
								onKeyDown={ ( event: React.KeyboardEvent< HTMLDivElement > ) => {
									if ( event.key === 'Enter' || event.key === ' ' ) {
										focus( violation );
									}
								} }
								sx={ {
									display: 'flex',
									alignItems: 'center',
									gap: 1,
									paddingBlock: 0.5,
									paddingInline: 2,
									borderRadius: 1,
									cursor: 'pointer',
									'& .violation-hover-icon': { opacity: 0, transition: 'opacity .15s' },
									'&:hover': { bgcolor: 'action.hover' },
									'&:hover .violation-hover-icon, &:focus-visible .violation-hover-icon': { opacity: 1 },
								} }
							>
								{ widgetIcon ? (
									<Box
										component="i"
										className={ widgetIcon }
										aria-hidden={ true }
										sx={ { fontSize: 'inherit', width: '1em', textAlign: 'center' } }
									/>
								) : violation.targetHint === 'page-settings' ? (
									<FileSettingsIcon fontSize="inherit" aria-hidden={ true } />
								) : violation.targetHint === 'site-settings' ? (
									<SettingsIcon fontSize="inherit" aria-hidden={ true } />
								) : null }
								<Typography variant="caption" sx={ { flex: 1 } }>
									{ ( violation.elementId ? getElementTitle( violation.elementId ) : null ) ??
										violation.label }
								</Typography>
								<EyeIcon className="violation-hover-icon" fontSize="tiny" aria-hidden={ true } />
							</Box>
						);
					} ) }
					</Box>
				) }
			</Collapse>
		</Box>
	);
}
