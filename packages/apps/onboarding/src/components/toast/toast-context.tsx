import * as React from 'react';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { XIcon } from '@elementor/icons';
import { IconButton, Snackbar } from '@elementor/ui';

interface Toast {
	id: string;
	message: string;
}

interface ToastContextValue {
	showToast: (message: string) => void;
	dismissToast: (id: string) => void;
}

const AUTO_HIDE_DURATION = 8000;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const idCounter = useRef(0);

	const showToast = useCallback((message: string) => {
		const id = String(++idCounter.current);
		setToasts((prev) => [...prev, { id, message }]);
	}, []);

	const dismissToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

	const currentToast = toasts[0] ?? null;

	const handleClose = useCallback(
		(_event?: React.SyntheticEvent | Event, reason?: string) => {
			if (reason === 'clickaway') {
				return;
			}
			if (currentToast) {
				dismissToast(currentToast.id);
			}
		},
		[currentToast, dismissToast]
	);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<Snackbar
				open={!!currentToast}
				autoHideDuration={AUTO_HIDE_DURATION}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				ContentProps={{
					elevation: 6,
					sx: {
						borderRadius: '4px',
						'& .MuiSnackbarContent-action': {
							gap: '4px',
							marginInlineStart: '4px',
						},
					},
				}}
				message={currentToast?.message}
				action={
					<IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
						<XIcon fontSize="small" />
					</IconButton>
				}
			/>
		</ToastContext.Provider>
	);
}

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);

	if (!ctx) {
		throw new Error('useToast must be used within a ToastProvider');
	}

	return ctx;
}
