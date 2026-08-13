type ExtendedWindow = Window & {
  elementor: {
    config: {
      atomic?: {
        default_styles?: {
          allowed_tags?: string[];
        };
      };
    };
  };
};

const getElementorConfig = () => ( window as unknown as ExtendedWindow ).elementor?.config ?? {};

export const getAllowedDefaultStyleTags = (): string[] => {
  const tags = getElementorConfig().atomic?.default_styles?.allowed_tags;

  if ( ! tags?.length ) {
    return [];
  }

  return tags;
};

export type AllowedHtmlTag = string;

export const getDefaultActiveTag = ( tags: string[] ): AllowedHtmlTag => {
  if ( tags.includes( 'h1' ) ) {
    return 'h1';
  }

  return tags[ 0 ] ?? '';
};

export const isAllowedDefaultStyleTag = (
  tag: string,
  tags = getAllowedDefaultStyleTags()
): tag is AllowedHtmlTag => tags.includes( tag );
