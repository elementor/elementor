import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Dialog,
	Box,
	Stack,
	Typography,
	Button,
	Divider,
	List,
	ListItem,
} from '@elementor/ui';

export const ProFreeTrialDialog = ( { doClose, popupData } ) => {
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
				backgroundImage: `url(${ popupData.image || 'https://assets.elementor.com/pro-free-trial/v1/images/pro_trial.png' })`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			} } />
			<Stack pt={ 3 } pb={ 1.5 } px={ 3 } gap={ 3 }>
				<Box>
					<Typography variant="h6" color="text.primary">
						{ popupData.heading || 'Try Elementor Pro Free' }
					</Typography>
					<Typography variant="h6" color="text.primary">
						{ popupData.subheading || 'Elementor Pro Free Trial' }
					</Typography>
				</Box>
				<Box>
					<Typography variant="body1" color="text.secondary">
						{ popupData.introduction || 'Unlock advanced features and take your website to the next level.' }
					</Typography>
					<List sx={ { pl: 2 } }>
						{ ( popupData.listItems || [] ).map( ( text, index ) => {
							return (
								<ListItem key={ index } sx={ { listStyle: 'disc', display: 'list-item', color: 'text.secondary', p: 0 } }>
									<Typography variant="body1">{ text }</Typography>
								</ListItem>
							);
						} ) }
					</List>
				</Box>
			</Stack>
			<Divider />
			<Stack py={ 2 } px={ 3 } direction="row" justifyContent="flex-end" gap={ 1.5 }>
				<Button
					onClick={ doClose }
					color="secondary"
					variant="text"
				>
					{ popupData.secondaryAction || 'Not now' }
				</Button>
				<Button
					variant="contained"
					color="accent"
					href={ popupData.ctaUrl || 'https://go.elementor.com/pro-trial' }
					target="_blank"
				>
					{ popupData.ctaText || 'Unlock my free trial' }
				</Button>
			</Stack>
		</Dialog>
	);
};

ProFreeTrialDialog.propTypes = {
	doClose: PropTypes.func,
	popupData: PropTypes.object,
};
