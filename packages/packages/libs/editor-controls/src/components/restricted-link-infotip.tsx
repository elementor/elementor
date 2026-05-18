import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { getContainer, type LinkInLinkRestriction, selectElement } from '@elementor/editor-elements';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, AlertAction, AlertTitle, Box, Infotip, Link } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useLinkNavigationContext } from '../context/link-navigation-context';

const learnMoreButton = {
	label: __( 'Learn More', 'elementor' ),
	href: 'https://go.elementor.com/element-link-inside-link-infotip',
};

const INFOTIP_CONTENT = {
	descendant: __(
		'To add a link or action to this element, first remove the link or action from the elements inside of it.',
		'elementor'
	),
	ancestor: __(
		'To add a link or action to this container, first remove the link or action from its parent container.',
		'elementor'
	),
};

type RestrictedLinkInfotipProps = PropsWithChildren< {
	linkInLinkRestriction: LinkInLinkRestriction;
	isVisible: boolean;
} >;

export const RestrictedLinkInfotip: React.FC< RestrictedLinkInfotipProps > = ( {
	linkInLinkRestriction,
	isVisible,
	children,
} ) => {
	const { shouldRestrict, reason, elementId } = linkInLinkRestriction;
	const { onNavigate, hideCrossDocumentTargets = true } = useLinkNavigationContext();

	const navigateHandler = onNavigate === undefined ? selectElement : onNavigate;
	const isTargetInCurrentDocument = !! ( elementId && getContainer( elementId )?.view?.el );
	const canNavigateToTarget =
		!! navigateHandler && !! elementId && ( ! hideCrossDocumentTargets || isTargetInCurrentDocument );

	const handleNavigateClick = () => {
		if ( elementId && navigateHandler ) {
			navigateHandler( elementId );
		}
	};

	const content = (
		<Alert
			color="secondary"
			icon={ <InfoCircleFilledIcon /> }
			size="small"
			action={
				canNavigateToTarget ? (
					<AlertAction
						sx={ { width: 'fit-content' } }
						variant="contained"
						color="secondary"
						onClick={ handleNavigateClick }
					>
						{ __( 'Take me there', 'elementor' ) }
					</AlertAction>
				) : undefined
			}
		>
			<AlertTitle>{ __( 'Nested links', 'elementor' ) }</AlertTitle>
			<Box component="span">
				{ INFOTIP_CONTENT[ reason ?? 'descendant' ] }{ ' ' }
				<Link href={ learnMoreButton.href } target="_blank" color="info.main">
					{ learnMoreButton.label }
				</Link>
			</Box>
		</Alert>
	);

	return shouldRestrict && isVisible ? (
		<Infotip
			placement="right"
			content={ content }
			color="secondary"
			slotProps={ { popper: { sx: { width: 300 } } } }
		>
			<Box>{ children }</Box>
		</Infotip>
	) : (
		<>{ children }</>
	);
};
