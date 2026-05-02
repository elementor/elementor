import ChevronRightIcon from '@elementor/icons/ChevronRightIcon';
import SearchIcon from '@elementor/icons/SearchIcon';
import EditorIcon from '../icons/editor';
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
					<EditorIcon />
				</SiteIconBox>
				<SiteTitle variant="subtitle1">{ siteTitle }</SiteTitle>
				<SearchButton onClick={ finderAction }>
					<SearchIcon />
				</SearchButton>
			</HeaderContent>
			<CollapseButton onClick={ onCollapse } size="small" expanded>
				<ChevronRightIcon />
			</CollapseButton>
		</HeaderContainer>
	);
};

SidebarHeader.propTypes = {
	siteTitle: PropTypes.string.isRequired,
	onCollapse: PropTypes.func.isRequired,
};

export default SidebarHeader;

