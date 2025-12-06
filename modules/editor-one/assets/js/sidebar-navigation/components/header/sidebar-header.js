import ChevronLeftIcon from '@elementor/icons/ChevronLeftIcon';
import SearchIcon from '@elementor/icons/SearchIcon';
import WebsiteIcon from '@elementor/icons/WebsiteIcon';
import PropTypes from 'prop-types';
import { CollapseButton, SiteIconBox } from '../shared';
import { HeaderContainer, HeaderContent, SearchButton, SiteTitle } from './styled-components';

const SidebarHeader = ( { siteTitle, onCollapse } ) => {
	const finderAction = () => {
		$e.route( 'finder' );
	};

	return (
		<HeaderContainer>
			<HeaderContent>
				<SiteIconBox>
					<WebsiteIcon sx={ { fontSize: 24 } } />
				</SiteIconBox>
				<SiteTitle>{ siteTitle }</SiteTitle>
				<SearchButton onClick={ finderAction }>
					<SearchIcon />
				</SearchButton>
			</HeaderContent>
			<CollapseButton onClick={ onCollapse }>
				<ChevronLeftIcon sx={ { fontSize: 16 } } />
			</CollapseButton>
		</HeaderContainer>
	);
};

SidebarHeader.propTypes = {
	siteTitle: PropTypes.string.isRequired,
	onCollapse: PropTypes.func.isRequired,
};

export default SidebarHeader;

