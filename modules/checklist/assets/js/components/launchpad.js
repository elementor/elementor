import { Box, styled } from '@elementor/ui';
import CheckList from './checklist';
import Header from './header';

const LaunchpadCont = styled( Box )( {
	position: 'fixed',
	width: '360px',
	bottom: '40px',
	right: '40px',
	zIndex: '99999',
	backgroundColor: 'white',
} );

function Launchpad() {
	return (
		<LaunchpadCont>
			<Header />
			<CheckList />
		</LaunchpadCont>
	);
}

export default Launchpad;
