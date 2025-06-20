import { ComponentType, ComponentPropsWithoutRef } from 'react';

type Components = Record<string, ComponentType<any>>;
type MenuGroups<TGroups extends string> = TGroups | 'default';

type RegisterItem<TGroups extends string, TComponent extends ComponentType> = (args: {
    id: string;
    group?: MenuGroups<TGroups>;
    priority?: number;
    overwrite?: boolean;
} & Props<ComponentPropsWithoutRef<TComponent>>) => void;
type Props<TProps extends object> = unknown extends TProps ? NoProps : PropsOrUseProps<TProps>;
type NoProps = {
    props?: never;
    useProps?: never;
};
type PropsOrUseProps<TProps extends object> = {
    props: TProps;
    useProps?: never;
} | {
    useProps: () => TProps;
    props?: never;
};

type UseMenuItems<TGroups extends string> = () => GroupedMenuItems<TGroups>;
type GroupedMenuItems<TGroups extends string> = Record<MenuGroups<TGroups>, Array<{
    id: string;
    MenuItem: ComponentType;
}>>;

type Menu<TComponents extends Components, TGroups extends string> = {
    useMenuItems: UseMenuItems<TGroups>;
} & RegisterFns<TGroups, TComponents>;
declare function createMenu<TComponents extends Components, TGroups extends string = 'default'>({ groups, components, }: {
    groups?: TGroups[];
    components: TComponents;
}): Menu<TComponents, TGroups>;
type RegisterFns<TGroups extends string, TComponents extends Components> = {
    [K in keyof TComponents as `register${Capitalize<K & string>}`]: RegisterItem<TGroups, TComponents[K]>;
};

export { type Components, type Menu, createMenu };
