import * as _elementor_menus from '@elementor/menus';
import * as _elementor_locations from '@elementor/locations';
import * as React from 'react';
import { ElementType } from 'react';

type Props$2 = {
    title: string;
    icon: ElementType;
    disabled?: boolean;
    visible?: boolean;
    onClick?: () => void;
};
declare function Action({ icon: Icon, title, visible, ...props }: Props$2): React.JSX.Element | null;

type Props$1 = {
    title: string;
    icon: ElementType;
    href?: string;
    visible?: boolean;
    target?: string;
};
declare function Link({ icon: Icon, title, visible, ...props }: Props$1): React.JSX.Element | null;

type Props = {
    title: string;
    icon: ElementType;
    selected?: boolean;
    disabled?: boolean;
    visible?: boolean;
    onClick?: () => void;
    value?: string;
};
declare function ToggleAction({ icon: Icon, title, value, visible, ...props }: Props): React.JSX.Element | null;

declare const injectIntoPageIndication: (args: _elementor_locations.InjectArgs<object>) => void;
declare const injectIntoResponsive: (args: _elementor_locations.InjectArgs<object>) => void;
declare const injectIntoPrimaryAction: (args: _elementor_locations.InjectArgs<object>) => void;
declare const mainMenu: _elementor_menus.Menu<{
    Action: typeof Action;
    ToggleAction: typeof ToggleAction;
    Link: typeof Link;
}, "exits">;
declare const toolsMenu: _elementor_menus.Menu<{
    Action: typeof Action;
    ToggleAction: typeof ToggleAction;
    Link: typeof Link;
}, "default">;
declare const utilitiesMenu: _elementor_menus.Menu<{
    Action: typeof Action;
    ToggleAction: typeof ToggleAction;
    Link: typeof Link;
}, "default">;
declare const integrationsMenu: _elementor_menus.Menu<{
    Action: typeof Action;
    ToggleAction: typeof ToggleAction;
    Link: typeof Link;
}, "default">;

declare const documentOptionsMenu: _elementor_menus.Menu<{
    Action: typeof Action;
    ToggleAction: typeof ToggleAction;
    Link: typeof Link;
}, "save">;

declare function init(): void;

export { type Props$2 as ActionProps, type Props$1 as LinkProps, type Props as ToggleActionProps, documentOptionsMenu, init, injectIntoPageIndication, injectIntoPrimaryAction, injectIntoResponsive, integrationsMenu, mainMenu, toolsMenu, utilitiesMenu };
