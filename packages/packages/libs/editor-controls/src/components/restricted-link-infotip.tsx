import * as React from 'react';
import { type PropsWithChildren } from 'react';
import {
	getContainer,
	getCurrentDocumentId,
	type LinkInLinkRestriction,
	selectElement,
} from '@elementor/editor-elements';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, AlertAction, AlertTitle, Box, Infotip, Link } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

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

function isTargetInCurrentDocument( elementId: string | null | undefined ): boolean {
	if ( ! elementId ) {
		return false;
	}

	const el = getContainer( elementId )?.view?.el;

	if ( ! el ) {
		return false;
	}

	const targetDocId = el.closest( '[data-elementor-id]' )?.getAttribute( 'data-elementor-id' );
	const currentDocId = String( getCurrentDocumentId() ?? '' );

	return !! ( targetDocId && currentDocId && targetDocId === currentDocId );
}

export const RestrictedLinkInfotip: React.FC< RestrictedLinkInfotipProps > = ( {
	linkInLinkRestriction,
	isVisible,
	children,
} ) => {
	const { shouldRestrict, reason, elementId } = linkInLinkRestriction;

	const showTakeMeThereCta = !! ( elementId && isTargetInCurrentDocument( elementId ) );

	const handleTakeMeClick = () => {
		if ( elementId ) {
			selectElement( elementId );
		}
	};

	const content = (
		<Alert
			color="secondary"
			icon={ <InfoCircleFilledIcon /> }
			size="small"
			action={
				showTakeMeThereCta ? (
					<AlertAction
						sx={ { width: 'fit-content' } }
						variant="contained"
						color="secondary"
						onClick={ handleTakeMeClick }
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
