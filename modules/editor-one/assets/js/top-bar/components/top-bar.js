import { useState } from '@wordpress/element';
import { Badge, Tooltip } from '@elementor/ui';
import BulbIcon from '@elementor/icons/BulbIcon';
import HelpIcon from '@elementor/icons/HelpIcon';
import SpeakerphoneIcon from '@elementor/icons/SpeakerphoneIcon';
import UserIcon from '@elementor/icons/UserIcon';
import PropTypes from 'prop-types';
import {
	AccountButton,
	IconButtonStyled,
	LogoContainer,
	RightSection,
	Title,
	TopBarContainer,
	VerticalDivider,
} from './styled-components';
import ElementorLogo from './elementor-logo';
import { WhatsNewDrawer } from './whats-new';

const TopBar = ( { config } ) => {
	const [ isWhatsNewOpen, setIsWhatsNewOpen ] = useState( false );
	const [ hasUnread, setHasUnread ] = useState( config.hasUnreadNotifications );

	const handleTipsClick = () => {
		window.open( config.tipsUrl, '_blank' );
	};

	const handleWhatsNewClick = () => {
		setIsWhatsNewOpen( true );
		setHasUnread( false );
	};

	const handleHelpClick = () => {
		window.open( config.helpUrl, '_blank' );
	};

	const handleAccountClick = () => {
		window.open( config.accountUrl, '_blank' );
	};

	return (
		<TopBarContainer>
			<LogoContainer>
				<ElementorLogo />
				<Title>{ config.title }</Title>
			</LogoContainer>
			<RightSection>
				<Tooltip title={ __( 'Academy', 'elementor' ) }>
					<IconButtonStyled size="small" onClick={ handleTipsClick }>
						<BulbIcon />
					</IconButtonStyled>
				</Tooltip>
				<Tooltip title={ __( "What's New", 'elementor' ) }>
					<IconButtonStyled size="small" onClick={ handleWhatsNewClick }>
						<Badge color="primary" variant="dot" invisible={ ! hasUnread }>
							<SpeakerphoneIcon />
						</Badge>
					</IconButtonStyled>
				</Tooltip>
				<Tooltip title={ __( 'Help', 'elementor' ) }>
					<IconButtonStyled size="small" onClick={ handleHelpClick }>
						<HelpIcon />
					</IconButtonStyled>
				</Tooltip>
				<VerticalDivider orientation="vertical" flexItem />
				<AccountButton
					startIcon={ <UserIcon /> }
					onClick={ handleAccountClick }
				>
					{ config.accountText }
				</AccountButton>
			</RightSection>
			<WhatsNewDrawer
				isOpen={ isWhatsNewOpen }
				setIsOpen={ setIsWhatsNewOpen }
			/>
		</TopBarContainer>
	);
};

TopBar.propTypes = {
	config: PropTypes.object.isRequired,
};

export default TopBar;

