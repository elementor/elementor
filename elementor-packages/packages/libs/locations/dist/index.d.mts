import { ComponentType, PropsWithChildren } from 'react';

type AnyProps = object;
type InjectedComponent<TProps extends object = AnyProps> = ComponentType<TProps>;
type Id = string;
type Priority = number;
type Injection<TProps extends object = AnyProps> = {
    /**
     * A unique id (per location) of the injected component.
     */
    id: Id;
    /**
     * The injected component.
     */
    component: InjectedComponent<TProps>;
    /**
     * Priority of the injected component inside the location. Lower value means higher priority.
     */
    priority: Priority;
};
type ReplaceableInjection<TProps extends object = AnyProps> = Injection<TProps> & {
    /**
     * A function that returns a boolean indicating whether the injection should be applied or not.
     */
    condition?: (props: TProps) => boolean;
};
type InjectArgs<TProps extends object = AnyProps> = {
    /**
     * A unique id (per location) of the component to be injected.
     */
    id: Id;
    /**
     * The component to be injected.
     */
    component: InjectedComponent<TProps>;
    options?: {
        /**
         * Priority of the injected component inside the location. Lower value means higher priority.
         */
        priority?: Priority;
        /**
         * When true, if an injected component with the same id already exists it will be overridden with this one. Otherwise, this injection will be ignored. Default is false.
         */
        overwrite?: boolean;
    };
};
type ReplaceableInjectArgs<TProps extends object = AnyProps> = Pick<InjectArgs<TProps>, 'id' | 'component'> & {
    /**
     * A function that returns a boolean indicating whether the injection should be applied or not.
     */
    condition?: (props: TProps) => boolean;
    options?: {
        /**
         * Priority of the injected component inside the location. Lower value means higher priority.
         */
        priority?: Priority;
    };
};
type Location<TProps extends object = AnyProps> = {
    /**
     * Inject a component into the location.
     */
    inject: (args: InjectArgs<TProps>) => void;
    /**
     *
     * @return All the injections in the location.
     */
    getInjections: () => Injection<TProps>[];
    useInjections: () => Injection<TProps>[];
    Slot: ComponentType<TProps>;
};
type ReplaceableLocation<TProps extends object = AnyProps> = {
    /**
     * Register a component into the location.
     */
    inject: (args: ReplaceableInjectArgs<TProps>) => void;
    /**
     *
     * @return All the injections in the location.
     */
    getInjections: () => ReplaceableInjection<TProps>[];
    useInjections: () => ReplaceableInjection<TProps>[];
    Slot: ComponentType<PropsWithChildren<TProps>>;
};

declare function createLocation<TProps extends object = AnyProps>(): Location<TProps>;

declare function createReplaceableLocation<TProps extends object = AnyProps>(): ReplaceableLocation<TProps>;

declare function flushAllInjections(): void;

export { type AnyProps, type Id, type InjectArgs, type InjectedComponent, type Injection, type Location, type Priority, type ReplaceableInjectArgs, type ReplaceableInjection, type ReplaceableLocation, flushAllInjections as __flushAllInjections, createLocation, createReplaceableLocation };
