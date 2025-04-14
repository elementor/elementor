import { __ } from '@wordpress/i18n';
import {
	Typography,
	Button,
	Stack,
	List,
	ListItem,
	Box, Link, Divider, Dialog,
} from '@elementor/ui';
import { useEffect, useRef, useState } from 'react';

const i18n = {
	heading: __( 'Say hello to a new experience!', 'elementor' ),
	introduction: __( 'You\'re now using Editor V4, a new generation of web creation.', 'elementor' ),
	listItems: [
		__( 'Try out Editor V4 elements such as Div, SVG and Paragraph.', 'elementor' ),
		__( 'Set up a new Class and apply it site-wide for perfect consistency.', 'elementor' ),
		__( 'Customize any style element per screen size by switching between responsive views.', 'elementor' ),
	],
	footerText: __( 'Need help getting started?', 'elementor' ),
	helpCenter: __( 'Learn more', 'elementor' ),
	closeButton: __( 'Let\'s Go', 'elementor' ),
};

const contentLinks = {
	helpCenter: 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/',
};

export const WelcomeDialog = ( { doClose } ) => {
	const anchorElRef = useRef( null );
	const [ isMounted, setIsMounted ] = useState( false );

	useEffect( () => {
		anchorElRef.current = document.body;
		setIsMounted( true );
	}, [] );

	if ( ! isMounted || ! anchorElRef.current ) {
		return null;
	}

	return (
		<Dialog
			open={ Boolean( anchorElRef.current ) }
			onClose={ doClose }
			maxWidth="sm"
		>
			<Box sx={ {
				aspectRatio: '2',
				backgroundImage: 'url(https://assets.elementor.com/v4-promotion/v1/images/v4_opt_in.png)',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			} } />
			<Stack pt={ 3 } pb={ 1.5 } px={ 3 } gap={ 3 }>
				<Typography variant="h6" color="text.primary">{ i18n.heading }</Typography>
				<Box>
					<Typography variant="body1" color="text.secondary">{ i18n.introduction }</Typography>
					<List sx={ { pl: 2 } }>
						{ i18n.listItems.map( ( text, index ) => {
							return (
								<ListItem key={ index } sx={ { listStyle: 'disc', display: 'list-item', color: 'text.secondary', p: 0 } }>
									<Typography variant="body1">{ text }</Typography>
								</ListItem>
							);
						} ) }
					</List>
				</Box>
				<Stack direction="row" alignItems="center" gap={ 1.5 }>
					<Typography variant="body1" color="text.secondary">{ i18n.footerText }</Typography>
					<Link href={ contentLinks.helpCenter } target="_blank" variant="body1" color="info.main" sx={ { textDecoration: 'none' } }>{ i18n.helpCenter }</Link>
				</Stack>
			</Stack>
			<Divider />
			<Stack py={ 2 } px={ 3 }>
				<Button
					variant="contained"
					color="accent"
					onClick={ doClose }
					sx={ { ml: 'auto' } }
				>{ i18n.closeButton }</Button>
			</Stack>
		</Dialog>
	);
};

WelcomeDialog.propTypes = {
	doClose: PropTypes.func,
};
