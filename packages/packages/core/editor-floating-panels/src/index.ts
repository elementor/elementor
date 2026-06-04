export { createFloatingPanel, registerFloatingPanel } from './api';
export * from './components/external';
export { useFloatingPanelActions } from './hooks/use-floating-panel-actions';
export { useFloatingPanelStatus } from './hooks/use-floating-panel-status';
export { init } from './init';
export type {
	FloatingPanelDeclaration,
	FloatingPanelDefaults,
	FloatingPanelHeaderAction,
	FloatingPanelState,
	LogicalPosition,
	LogicalSize,
} from './types';
