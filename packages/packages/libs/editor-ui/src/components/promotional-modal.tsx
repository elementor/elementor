import * as React from 'react';
import { Box, Button, CloseButton, Image, Popover, Stack, Typography } from '@elementor/ui';

type PromotionalModalProps = {
	open: boolean;
	onClose: () => void;
	anchorEl: HTMLElement | null;
	title: string;
	imageUrl: string;
	ctaText: string;
	ctaHref?: string;
	onCtaClick?: () => void;
	children: React.ReactNode;
};

export const PromotionalModal = ( {
	open,
	onClose,
	anchorEl,
	title,
	imageUrl,
	ctaText,
	ctaHref,
	onCtaClick,
	children,
}: PromotionalModalProps ) => {
	if ( ! anchorEl ) {
		return null;
	}

	const handleCtaClick = () => {
		if ( ctaHref ) {
			window.open( ctaHref, '_blank' );
		}
		onCtaClick?.();
		onClose();
	};

	return (
		<Popover
			anchorEl={ anchorEl }
			open={ open }
			anchorOrigin={ {
				vertical: 'center',
				horizontal: 'right',
			} }
			transformOrigin={ {
				vertical: 'bottom',
				horizontal: 'left',
			} }
			onClose={ onClose }
			slotProps={ {
				paper: {
					sx: {
						width: 296,
						borderRadius: 1,
						overflow: 'visible',
						ml: 1,
						mt: '10px',
						'&::before': {
							content: '""',
							display: 'block',
							position: 'absolute',
							bottom: 18,
							left: -5,
							width: 10,
							height: 10,
							bgcolor: 'background.paper',
							transform: 'rotate(45deg)',
							zIndex: 0,
							boxShadow: '-1px 1px 2px rgba(0,0,0,0.1)',
						},
					},
				},
			} }
		>
			<Box
				sx={ { width: '100%', position: 'relative', zIndex: 1, bgcolor: 'background.paper', borderRadius: 1 } }
			>
				<Stack direction="row" alignItems="center" justifyContent="space-between" sx={ { px: 2, py: 1.25 } }>
					<Typography variant="subtitle2" sx={ { fontWeight: 500, color: 'text.primary' } }>
						{ title }
					</Typography>
					<CloseButton
						slotProps={ { icon: { fontSize: 'tiny' } } }
						sx={ { color: 'text.tertiary' } }
						onClick={ onClose }
					/>
				</Stack>

				<Image sx={ { width: '100%', height: 160 } } src={ imageUrl } alt="" />

				<Stack sx={ { p: 2, gap: 2 } }>
					<Typography variant="body2" color="text.primary">
						{ children }
					</Typography>
					<Stack direction="row" justifyContent="flex-end">
						<Button
							size="medium"
							variant="contained"
							onClick={ handleCtaClick }
							sx={ {
								bgcolor: '#E668B8',
								color: '#0C0D0E',
								'&:hover': {
									bgcolor: '#D45AA8',
								},
							} }
						>
							{ ctaText }
						</Button>
					</Stack>
				</Stack>
			</Box>
		</Popover>
	);
};
