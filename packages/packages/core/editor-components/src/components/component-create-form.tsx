import * as React from 'react';
import { FloatingPortal } from '@floating-ui/react';

type ComponentFormData = {
	model: any;
	content: any[];
};

export function ComponentCreateForm() {
	const [isVisible, setIsVisible] = React.useState(false);
	const [formData, setFormData] = React.useState<ComponentFormData | null>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [componentName, setComponentName] = React.useState('');

	// Listen for save component event from the legacy div-block-view
	React.useEffect(() => {
		const handleSaveComponentRequested = (event: CustomEvent<ComponentFormData>) => {
			setFormData(event.detail);
			setIsVisible(true);
			// Generate default name with timestamp
			const currentDate = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
			setComponentName(`component-test-${currentDate}`);
		};

		window.addEventListener('elementor/editor/save-component-requested', handleSaveComponentRequested as EventListener);

		return () => {
			window.removeEventListener('elementor/editor/save-component-requested', handleSaveComponentRequested as EventListener);
		};
	}, []);

	const handleSave = async () => {
		if (!formData || !componentName.trim()) {
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch('/wp-json/elementor/v1/components', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': (window as any).wpApiSettings?.nonce,
				},
				body: JSON.stringify({
					name: componentName.trim(),
					content: formData.content,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to save component');
			}

			const result = await response.json();
			
			// Show success message using Elementor's dialog system
			(window as any).elementorCommon.dialogsManager.createWidget('alert', {
				message: `Component saved successfully as: ${componentName} (ID: ${result.component_id})`,
			}).show();

			handleCancel();
		} catch (error) {
			console.error('Error saving component:', error);
			
			(window as any).elementorCommon.dialogsManager.createWidget('alert', {
				message: error instanceof Error ? error.message : 'Failed to save component. Please try again.',
			}).show();
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setIsVisible(false);
		setFormData(null);
		setComponentName('');
		setIsLoading(false);
	};

	if (!isVisible || !formData) {
		return null;
	}

	return (
		<FloatingPortal>
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 999999,
				}}
				onClick={(e) => {
					if (e.target === e.currentTarget) {
						handleCancel();
					}
				}}
			>
				<div
					style={{
						backgroundColor: 'white',
						borderRadius: '8px',
						padding: '24px',
						minWidth: '400px',
						maxWidth: '500px',
						boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
						Save as Component
					</h2>
					
					<div style={{ marginBottom: '20px' }}>
						<label 
							htmlFor="component-name"
							style={{ 
								display: 'block', 
								marginBottom: '8px', 
								fontWeight: '500',
								fontSize: '14px'
							}}
						>
							Component Name:
						</label>
						<input
							id="component-name"
							type="text"
							value={componentName}
							onChange={(e) => setComponentName(e.target.value)}
							placeholder="Enter component name..."
							disabled={isLoading}
							style={{
								width: '100%',
								padding: '10px 12px',
								border: '1px solid #ddd',
								borderRadius: '4px',
								fontSize: '14px',
								boxSizing: 'border-box',
							}}
						/>
					</div>

					<div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
						<button
							type="button"
							onClick={handleCancel}
							disabled={isLoading}
							style={{
								padding: '10px 20px',
								border: '1px solid #ddd',
								borderRadius: '4px',
								backgroundColor: 'white',
								cursor: isLoading ? 'not-allowed' : 'pointer',
								fontSize: '14px',
							}}
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSave}
							disabled={isLoading || !componentName.trim()}
							style={{
								padding: '10px 20px',
								border: 'none',
								borderRadius: '4px',
								backgroundColor: isLoading || !componentName.trim() ? '#ccc' : '#0073aa',
								color: 'white',
								cursor: isLoading || !componentName.trim() ? 'not-allowed' : 'pointer',
								fontSize: '14px',
							}}
						>
							{isLoading ? 'Saving...' : 'Save Component'}
						</button>
					</div>
				</div>
			</div>
		</FloatingPortal>
	);
} 