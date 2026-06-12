import * as React from 'react';
import { useState } from 'react';
import { getElementIcon, getElementTitle } from '@elementor/editor-elements';
import { AlertCircleIcon, BulbIcon, CheckIcon, ChevronDownIcon, EyeIcon, HelpIcon } from '@elementor/icons';
import { Alert, AlertTitle, Box, Collapse, IconButton, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useViolationFocus } from '../hooks/use-violation-focus';
import { type AuditMeta, type AuditViolation } from '../types';
import { buildAngiePrompt } from '../utils/build-angie-prompt';
import { onKeyboardClick } from '../utils/keyboard-click';
import FixViolationWithAngie from './fix-violation-with-angie';
import SeverityIcon from './severity-icons';
import ViolationIcon from './violation-icons';

type Props = {
	audit: AuditMeta;
	skipReason?: string;
	violations?: AuditViolation[];
};

function SkipReasonTooltip( { reason }: { reason: string } ) {
	return (
		<Tooltip
			title={ reason }
			placement="top"
		>
			<Box aria-label={ reason } component="span" sx={ { display: 'inline-flex', alignItems: 'center' } }>
				<HelpIcon fontSize="small" color="action" />
			</Box>
		</Tooltip>
	);
}

function StatusIndicator( { audit, violations }: Pick< Props, 'audit' | 'violations' > ) {
	if ( violations ) {
		return (
			<>
				<Typography variant="caption" color="text.secondary" fontWeight="bold">
					{ violations.length }
				</Typography>
				<SeverityIcon severity={ audit.severity } />
			</>
		);
	}

	return <CheckIcon fontSize="small" color="success" />;
}

export default function ViolationRow( { audit, skipReason, violations }: Props ) {
	const [ expanded, setExpanded ] = useState( false );
	const { focus } = useViolationFocus();

	const toggleExpanded = () => setExpanded( ( value ) => ! value );

	return (
		<Box sx={ { borderBottom: 1, borderColor: 'divider', paddingBlock: 0.5 } }>
			<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
				<Box
					sx={ {
						alignItems: 'center',
						cursor: 'pointer',
						display: 'flex',
						flex: 1,
						gap: 0.5,
						minWidth: 0,
					} }
					onClick={ toggleExpanded }
				>
					<Typography variant="body2" sx={ { flex: 1 } }>
						{ audit.title }
					</Typography>
					{ ! skipReason && <StatusIndicator audit={ audit } violations={ violations } /> }
				</Box>
				{ skipReason && <SkipReasonTooltip reason={ skipReason } /> }
				<IconButton
					size="small"
					aria-label={ expanded ? __( 'Collapse', 'elementor' ) : __( 'Expand', 'elementor' ) }
					onClick={ toggleExpanded }
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
					<Alert
						severity="secondary"
						sx={ { p: 1 } }
						icon={ <AlertCircleIcon fontSize="small" color="secondary" aria-hidden={ true } /> }
					>
						<AlertTitle>
							<Typography variant="caption" component="p" color="text.primary" fontWeight="bold">
								{ __( "What's the issue", 'elementor' ) }
							</Typography>
						</AlertTitle>
						<Typography variant="caption" component="p" color="text.secondary">
							{ audit.description }
						</Typography>
					</Alert>
					<Alert
						severity="info"
						sx={ { p: 1 } }
						icon={ <BulbIcon fontSize="small" color="info" aria-hidden={ true } /> }
					>
						<AlertTitle>
							<Typography variant="caption" component="p" color="text.primary" fontWeight="bold">
								{ __( 'How to resolve', 'elementor' ) }
							</Typography>
						</AlertTitle>
						<Typography variant="caption" component="p" color="text.secondary">
							{ audit.fixHint }
						</Typography>
					</Alert>
				</Box>
				{ violations && violations.length > 0 && (
					<Box role="list" sx={ { paddingBlockEnd: 1, paddingInlineStart: 2 } }>
						{ violations.map( ( violation, idx ) => {
							const widgetIcon = violation.elementId ? getElementIcon( violation.elementId ) : null;
							const elementTitle = violation.elementId ? getElementTitle( violation.elementId ) : null;
							const rowLabel = elementTitle
								? `${ elementTitle } - ${ violation.label }`
								: violation.label;

							return (
								<Box
									key={ idx }
									role="button"
									tabIndex={ 0 }
									onClick={ () => focus( violation ) }
									onKeyDown={ onKeyboardClick( () => focus( violation ) ) }
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
										'&:hover .violation-hover-icon, &:focus-visible .violation-hover-icon': {
											opacity: 1,
										},
									} }
								>
									<ViolationIcon violation={ violation } widgetIcon={ widgetIcon } />
									<Box sx={ { flex: 1 } }>
										<Typography variant="caption">{ rowLabel }</Typography>
										{ violation.detail && (
											<Typography variant="caption" color="text.secondary">
												{ violation.detail }
											</Typography>
										) }
									</Box>
									{ violation.angieFix && (
										<FixViolationWithAngie prompt={ buildAngiePrompt( rowLabel ) } />
									) }
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
