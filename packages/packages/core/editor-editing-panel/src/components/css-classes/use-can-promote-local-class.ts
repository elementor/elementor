import { useElement } from "../../contexts/element-context";
import { useStyle } from "../../contexts/style-context";
import { useCssClass } from "./css-class-context";

export const useCanPromoteLocalClass = () => {
    const { element } = useElement();
    const { label } = useCssClass();
    const { provider, id, meta } = useStyle();
    const styleDef = provider?.actions.get(id, { elementId: element.id, ...meta });
    const variants = styleDef?.variants || [];

    const canPromote =
        !!(styleDef
            && provider
            && label === 'local'
            && id?.startsWith('e-')
            && variants.length);

    return {
        canPromote,
        styleDef: styleDef || null
    }
}