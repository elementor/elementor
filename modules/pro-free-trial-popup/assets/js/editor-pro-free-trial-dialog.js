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

	if ( ! popupData || Object.values( popupData ).some( ( value ) => ! value ) ) {
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
				backgroundImage: `url(${ popupData.image })`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			} } />
			<Stack pt={ 3 } pb={ 1.5 } px={ 3 } gap={ 3 }>
				<Box>
					<Typography variant="h6" color="text.primary">
						{ popupData.heading }
					</Typography>
					<Typography variant="h6" color="text.primary">
						{ popupData.subheading }
					</Typography>
				</Box>
				<Box>
					<Typography variant="body1" color="text.secondary">
						{ popupData.introduction }
					</Typography>
					<List sx={ { pl: 2 } }>
						{ ( popupData.listItems ).map( ( text, index ) => {
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
					{ popupData.secondaryAction }
				</Button>
				<Button
					variant="contained"
					color="accent"
					href={ popupData.ctaUrl }
					target="_blank"
				>
					{ popupData.ctaText }
				</Button>
			</Stack>
		</Dialog>
	);
};

ProFreeTrialDialog.propTypes = {
	doClose: PropTypes.func,
	popupData: PropTypes.object,
};
