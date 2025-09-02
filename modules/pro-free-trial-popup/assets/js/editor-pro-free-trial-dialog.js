import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Dialog,
	Box,
	Stack,
	Typography,
	Button,
	Divider,
	Link,
	List,
	ListItem,
} from '@elementor/ui';

const i18n = {
	heading: elementorProFreeTrialData?.heading || 'Try Elementor Pro Free',
	introduction: elementorProFreeTrialData?.introduction || 'Unlock advanced features and take your website to the next level.',
	listItems: [
		__( 'Try out Editor V4 elements such as Div, SVG and Paragraph.', 'elementor' ),
		__( 'Set up a new Class and apply it site-wide for perfect consistency.', 'elementor' ),
		__( 'Customize any style element per screen size by switching between responsive views.', 'elementor' ),
	],
	footerText: __( 'Need help getting started?', 'elementor' ),
	helpCenter: __( 'Learn more', 'elementor' ),
	closeButton: __( 'Let\'s Go', 'elementor' ),
	learnMoreUrl: elementorProFreeTrialData?.learnMoreUrl || 'https://go.elementor.com/pro-trial',
};

const contentLinks = {
	learnMore: i18n.learnMoreUrl,
};

export const ProFreeTrialDialog = ( { doClose } ) => {
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
				backgroundImage: `url(${ elementorProFreeTrialData?.imageUrl || 'https://assets.elementor.com/pro-free-trial/v1/images/pro_trial.png' })`,
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
					<Link href={ contentLinks.learnMore } target="_blank" variant="body1" color="info.main" sx={ { textDecoration: 'none' } }>{ i18n.helpCenter }</Link>
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

ProFreeTrialDialog.propTypes = {
	doClose: PropTypes.func,
};