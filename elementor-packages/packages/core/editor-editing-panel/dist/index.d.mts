import { FontCategory } from '@elementor/editor-controls';
export { useBoundProp } from '@elementor/editor-controls';
import * as React from 'react';
import { ElementType, ComponentType } from 'react';
import * as _elementor_editor_props from '@elementor/editor-props';
import { ChipProps, Theme } from '@elementor/ui';
import * as _elementor_locations from '@elementor/locations';
import * as _elementor_menus from '@elementor/menus';

type PopoverActionProps = {
    title: string;
    visible?: boolean;
    icon: ElementType;
    content: ComponentType<{
        close: () => void;
    }>;
};
declare function PopoverAction({ title, visible, icon: Icon, content: PopoverContent, }: PopoverActionProps): React.JSX.Element | null;

declare const registerControlReplacement: (replacement: {
    component: React.ComponentType;
    condition: ({ value }: {
        value: _elementor_editor_props.PropValue;
    }) => boolean;
}) => void;

type Colors = {
    name: ChipProps['color'];
    getThemeColor: ((theme: Theme) => string) | null;
};
declare const registerStyleProviderToColors: (provider: string, colors: Colors) => void;

declare const injectIntoClassSelectorActions: (args: _elementor_locations.InjectArgs<object>) => void;

declare const usePanelActions: () => {
    open: () => Promise<void>;
    close: () => Promise<void>;
};
declare const usePanelStatus: () => {
    isOpen: boolean;
    isBlocked: boolean;
};

type ValidationResult = {
    isValid: true;
    errorMessage: null;
} | {
    isValid: false;
    errorMessage: string;
};
type ValidationEvent = 'inputChange' | 'create';

type ActionProps = {
    title: string;
    visible?: boolean;
    icon: ElementType;
    onClick: () => void;
};
declare function Action({ title, visible, icon: Icon, onClick }: ActionProps): React.JSX.Element | null;

declare const controlActionsMenu: _elementor_menus.Menu<{
    Action: typeof Action;
    PopoverAction: typeof PopoverAction;
}, "default">;

declare const useFontFamilies: () => FontCategory[];

declare const useSectionRef: () => React.RefObject<HTMLElement> | null;

declare function init(): void;

export { type PopoverActionProps, type ValidationEvent, type ValidationResult, controlActionsMenu, init, injectIntoClassSelectorActions, registerControlReplacement, registerStyleProviderToColors, useFontFamilies, usePanelActions, usePanelStatus, useSectionRef };
