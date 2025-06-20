import * as _elementor_locations from '@elementor/locations';

declare const injectIntoTop: (args: _elementor_locations.InjectArgs<object>) => void;
declare const injectIntoLogic: (args: _elementor_locations.InjectArgs<object>) => void;

declare function start(domElement: Element): void;

export { injectIntoLogic, injectIntoTop, start };
