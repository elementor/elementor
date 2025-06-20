import * as React from 'react';

type IconsMap = {
    [key: string]: React.ElementType;
};
declare function extendIconsMap(additionalIcons: IconsMap): void;

declare function init(): void;

export { extendIconsMap, init };
