import * as React from 'react';
import { ComponentType } from 'react';
import { UseRouteStatusOptions } from '@elementor/editor-v1-adapters';
import { DrawerProps, BoxProps, TypographyProps } from '@elementor/ui';

declare function init(): void;

type PanelDeclaration<TOnOpenReturn = unknown> = {
    id: string;
    component: ComponentType;
} & UseActionsOptions<TOnOpenReturn> & UseRouteStatusOptions;
declare function createPanel<TOnOpenReturn>({ id, component, onOpen, onClose, allowedEditModes, blockOnKitRoutes, }: PanelDeclaration<TOnOpenReturn>): {
    panel: {
        id: string;
        component: ComponentType;
    };
    usePanelStatus: UseStatus;
    usePanelActions: () => {
        open: () => Promise<void>;
        close: () => Promise<void>;
    };
};
declare function registerPanel({ id, component }: Pick<PanelDeclaration, 'id' | 'component'>): void;
type UseStatus = () => {
    isOpen: boolean;
    isBlocked: boolean;
};
type UseActionsOptions<TOnOpenReturn> = {
    onOpen?: () => TOnOpenReturn;
    onClose?: (state: TOnOpenReturn) => void;
};

declare function Panel({ children, sx, ...props }: DrawerProps): React.JSX.Element;

declare function PanelHeader({ children, ...props }: BoxProps): React.JSX.Element;

declare function PanelHeaderTitle({ children, ...props }: TypographyProps): React.JSX.Element;

declare function PanelBody({ children, sx, ...props }: BoxProps): React.JSX.Element;

declare function PanelFooter({ children, sx, ...props }: BoxProps): React.JSX.Element;

export { Panel, PanelBody, PanelFooter, PanelHeader, PanelHeaderTitle, createPanel as __createPanel, registerPanel as __registerPanel, init };
