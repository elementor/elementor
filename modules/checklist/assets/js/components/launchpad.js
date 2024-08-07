import { Box, styled } from '@elementor/ui';
import CheckList from './checklist';
import Header from './header';
import { useEffect } from "react";
import Paper from '@elementor/ui/Paper'

const LaunchpadCont = styled( Box )( {
	position: 'fixed',
	width: '360px',
	top: '100px',
	right: '40px',
	zIndex: '99999',
	backgroundColor: 'white',
} );

const Launchpad = ( props ) => {
	const { isOpen, setIsOpen } = props;

	return (
		<Paper elevation={5} sx={{position: 'fixed',
			width: '360px',
			top: '100px',
			right: '40px',
			zIndex: '99999',
			hidden: true,
			maxHeight: '645px',
			overflowY: 'auto',
		}}>
			<Header
				isOpen={ isOpen }
				setIsOpen={ setIsOpen }
			/>
			<CheckList />
		</Paper>
	);
}

export default Launchpad;
