import * as React from 'react';
import { getElementIcon, getElementTitle } from '@elementor/editor-elements';
import { useFloatingPanelZIndex } from '@elementor/editor-floating-panels';
import { CheckIcon, ChevronDownIcon, HelpIcon, InfoCircleIcon, WandIcon } from '@elementor/icons';
import { Alert, Box, Collapse, IconButton, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { AUDIT_PANEL_ID } from '../constants';
import { focusViolation } from '../hooks/focus-violation';
import { type AuditMeta, type AuditViolation } from '../types';
import { buildAngiePrompt } from '../utils/build-angie-prompt';
import { isScoredAudit } from '../utils/is-scored-audit';
import { onKeyboardClick } from '../utils/keyboard-click';
import FixViolationWithAngie from './fix-violation-with-angie';
import SeverityIcon from './severity-icons';
import ViolationCtaButton from './violation-cta-button';
import ViolationIcon from './violation-icons';

type Props = {
	audit: AuditMeta;
	expanded: boolean;
	onToggleExpand: () => void;
	skipReason?: string;
	violations?: AuditViolation[];
};

function SkipReasonTooltip( { reason }: { reason: string } ) {
	return (
		<Tooltip title={ reason } placement="top">
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
				<SeverityIcon severity={ audit.severity } />
				{ isScoredAudit( audit ) && (
					<Typography variant="caption" color="text.secondary" fontWeight="bold">
						{ violations.length }
					</Typography>
				) }
			</>
		);
	}

	return <CheckIcon fontSize="small" color="success" />;
}

function GuidanceAction( { violation }: { violation: AuditViolation } ) {
	const hasPrimaryCta = !! ( violation.ctaLabel && violation.externalUrl );

	if ( ! hasPrimaryCta ) {
		return null;
	}

	return (
		<Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mt: 1 } }>
			<ViolationCtaButton
				ctaLabel={ violation.ctaLabel as string }
				externalUrl={ violation.externalUrl as string }
				withIcon
			/>
			{ violation.secondaryCtaLabel && violation.secondaryCtaUrl && (
				<ViolationCtaButton
					ctaLabel={ violation.secondaryCtaLabel }
					externalUrl={ violation.secondaryCtaUrl }
					variant="text"
				/>
			) }
		</Box>
	);
}

export default function ViolationRow( { audit, expanded, onToggleExpand, skipReason, violations }: Props ) {
	const primaryViolation = violations?.[ 0 ];
	const isGuidanceFocusable = !! primaryViolation;
	const panelZIndex = useFloatingPanelZIndex( AUDIT_PANEL_ID );

	const handleGuidanceClick = () => {
		if ( isGuidanceFocusable && primaryViolation ) {
			focusViolation( primaryViolation );
		}
	};

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
					onClick={ onToggleExpand }
				>
					<Typography variant="subtitle2" color="text.secondary" sx={ { flex: 1 } }>
						{ audit.title }
					</Typography>
					{ ! skipReason && <StatusIndicator audit={ audit } violations={ violations } /> }
				</Box>
				{ skipReason && <SkipReasonTooltip reason={ skipReason } /> }
				<IconButton
					size="small"
					aria-label={ expanded ? __( 'Collapse', 'elementor' ) : __( 'Expand', 'elementor' ) }
					onClick={ onToggleExpand }
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
				<Box sx={ { paddingBlock: 1 } }>
					<Tooltip title={ audit.fixHint } placement="top">
						<Alert
							severity="secondary"
							sx={ { p: 1, cursor: isGuidanceFocusable ? 'pointer' : undefined } }
							icon={ <InfoCircleIcon fontSize="small" aria-hidden={ true } /> }
							role={ isGuidanceFocusable ? 'button' : undefined }
							tabIndex={ isGuidanceFocusable ? 0 : undefined }
							onClick={ isGuidanceFocusable ? handleGuidanceClick : undefined }
							onKeyDown={ isGuidanceFocusable ? onKeyboardClick( handleGuidanceClick ) : undefined }
						>
							<Typography variant="caption" component="p" color="text.secondary">
								{ audit.description }
							</Typography>
							{ primaryViolation && <GuidanceAction violation={ primaryViolation } /> }
						</Alert>
					</Tooltip>
				</Box>
				{ violations && violations.length > 0 && (
					<Box role="list" sx={ { paddingBlockEnd: 1 } }>
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
									onClick={ () => focusViolation( violation ) }
									onKeyDown={ onKeyboardClick( () => focusViolation( violation ) ) }
									sx={ {
										display: 'flex',
										alignItems: 'center',
										gap: 1,
										paddingBlock: 0.5,
										paddingInline: 1,
										borderRadius: 1,
										cursor: 'pointer',
										'&:hover': { bgcolor: 'action.hover' },
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
									{ violation.angieFix ? (
										<FixViolationWithAngie
											prompt={ violation.angiePrompt ?? buildAngiePrompt( rowLabel ) }
											panelZIndex={ panelZIndex }
										/>
									) : (
										<WandIcon fontSize="tiny" aria-hidden={ true } />
									) }
								</Box>
							);
						} ) }
					</Box>
				) }
			</Collapse>
		</Box>
	);
}
