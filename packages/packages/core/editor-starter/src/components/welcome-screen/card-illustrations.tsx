import * as React from 'react';
import { Box } from '@elementor/ui';

/**
 * AI Site Planner card illustration.
 * Shows a chat-like prompt UI with a sparkle icon and typing indicator.
 */
export function AiPlannerIllustration() {
	return (
		<Box
			sx={ {
				width: '100%',
				height: '100%',
				backgroundColor: '#FFF0F0',
				borderRadius: '6px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: '8px',
				px: '14px',
			} }
		>
			{ /* Chat prompt bubble */ }
			<Box
				sx={ {
					display: 'flex',
					alignItems: 'center',
					gap: '8px',
					backgroundColor: '#FFFFFF',
					borderRadius: '20px',
					px: '12px',
					py: '6px',
					boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
				} }
			>
				{ /* Sparkle icon */ }
				<Box
					component="svg"
					viewBox="0 0 16 16"
					sx={ { width: 14, height: 14, flexShrink: 0 } }
				>
					<path
						d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2L8 0Z"
						fill="#C00BB9"
					/>
				</Box>
				<Box
					component="span"
					sx={ {
						fontSize: '11px',
						color: 'text.secondary',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					} }
				>
					What&apos;s the name of the site?
				</Box>
			</Box>
			{ /* Typing indicator with avatar */ }
			<Box
				sx={ {
					display: 'flex',
					alignItems: 'center',
					gap: '6px',
					pl: '2px',
				} }
			>
				{ /* Avatar circle */ }
				<Box
					sx={ {
						width: 22,
						height: 22,
						borderRadius: '50%',
						background: 'linear-gradient(135deg, #FF6B35 0%, #FF9F1C 100%)',
						flexShrink: 0,
					} }
				/>
				{ /* Typing dots */ }
				<Box
					sx={ {
						display: 'flex',
						alignItems: 'center',
						gap: '4px',
						backgroundColor: '#FFE4E1',
						borderRadius: '12px',
						px: '10px',
						py: '6px',
					} }
				>
					{ [ 0, 1, 2 ].map( ( i ) => (
						<Box
							key={ i }
							sx={ {
								width: 6,
								height: 6,
								borderRadius: '50%',
								backgroundColor: '#C4A0A0',
							} }
						/>
					) ) }
				</Box>
			</Box>
		</Box>
	);
}

/**
 * Website Templates card illustration.
 * Shows overlapping template preview cards with a pink background.
 */
export function TemplatesIllustration() {
	return (
		<Box
			sx={ {
				width: '100%',
				height: '100%',
				backgroundColor: '#FADADD',
				borderRadius: '6px',
				position: 'relative',
				overflow: 'hidden',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			} }
		>
			{ /* Back template card */ }
			<Box
				sx={ {
					position: 'absolute',
					width: 80,
					height: 60,
					backgroundColor: '#FFFFFF',
					borderRadius: '4px',
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
					top: '10px',
					left: '16px',
					transform: 'rotate(-5deg)',
					overflow: 'hidden',
				} }
			>
				<Box
					sx={ {
						width: '100%',
						height: '14px',
						backgroundColor: '#2D2D2D',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					} }
				>
					<Box
						component="span"
						sx={ {
							fontSize: '5px',
							color: '#FFFFFF',
							fontWeight: 700,
							letterSpacing: '0.5px',
						} }
					>
						CANTERA
					</Box>
				</Box>
			</Box>
			{ /* Front template card */ }
			<Box
				sx={ {
					position: 'absolute',
					width: 80,
					height: 60,
					backgroundColor: '#FFFFFF',
					borderRadius: '4px',
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
					bottom: '14px',
					right: '16px',
					transform: 'rotate(3deg)',
					overflow: 'hidden',
				} }
			>
				<Box
					sx={ {
						width: '100%',
						height: '100%',
						background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D5C4 100%)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					} }
				>
					<Box
						component="span"
						sx={ {
							fontSize: '7px',
							fontWeight: 600,
							color: '#4A3728',
							fontStyle: 'italic',
						} }
					>
						NOEME
					</Box>
				</Box>
			</Box>
			{ /* Middle template card */ }
			<Box
				sx={ {
					position: 'relative',
					width: 80,
					height: 60,
					backgroundColor: '#FFFFFF',
					borderRadius: '4px',
					boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
					zIndex: 1,
					overflow: 'hidden',
				} }
			>
				<Box
					sx={ {
						width: '100%',
						height: '100%',
						background: 'linear-gradient(180deg, #D4E157 0%, #8BC34A 50%, #558B2F 100%)',
						display: 'flex',
						alignItems: 'flex-end',
						justifyContent: 'center',
						pb: '6px',
					} }
				>
					<Box
						component="span"
						sx={ {
							fontSize: '6px',
							fontWeight: 700,
							color: '#FFFFFF',
							letterSpacing: '1px',
						} }
					>
						YARD
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

/**
 * Blank Canvas card illustration.
 * Shows a plus icon on a light gray background.
 */
export function BlankCanvasIllustration() {
	return (
		<Box
			sx={ {
				width: '100%',
				height: '100%',
				backgroundColor: '#F5F5F5',
				borderRadius: '6px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			} }
		>
			<Box
				sx={ {
					width: 40,
					height: 40,
					borderRadius: '50%',
					border: '2px solid',
					borderColor: 'action.disabled',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				} }
			>
				<Box
					component="svg"
					viewBox="0 0 24 24"
					sx={ { width: 20, height: 20, color: 'action.disabled' } }
				>
					<path
						d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
						fill="currentColor"
					/>
				</Box>
			</Box>
		</Box>
	);
}
