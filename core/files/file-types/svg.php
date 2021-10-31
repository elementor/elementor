<?php
namespace Elementor\Core\Files\File_Types;

use Elementor\Core\Utils\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Svg extends Base {

	/**
	 * Inline svg attachment meta key
	 */
	const META_KEY = '_elementor_inline_svg';

	const SCRIPT_REGEX = '/(?:\w+script|data):/xi';

	/**
	 * @var \DOMDocument
	 */
	private $svg_dom = null;

	/**
	 * Get File Extension
	 *
	 * Returns the file type's file extension
	 *
	 * @since 3.5.0
	 * @access public
	 *
	 * @return string - file extension
	 */
	public function get_file_extension() {
		return 'svg';
	}

	/**
	 * Get Mime Type
	 *
	 * Returns the file type's mime type
	 *
	 * @since 3.5.0
	 * @access public
	 *
	 * @return string mime type
	 */
	public function get_mime_type() {
		return 'image/svg+xml';
	}

	/**
	 * Sanitize SVG
	 *
	 * @since 3.5.0
	 * @access public
	 *
	 * @param $filename
	 * @return bool
	 */
	public function sanitize_svg( $filename ) {
		$original_content = file_get_contents( $filename );
		$is_encoded = $this->is_encoded( $original_content );

		if ( $is_encoded ) {
			$decoded = $this->decode_svg( $original_content );
			if ( false === $decoded ) {
				return false;
			}
			$original_content = $decoded;
		}

		$valid_svg = $this->sanitizer( $original_content );

		if ( false === $valid_svg ) {
			return false;
		}

		// If we were gzipped, we need to re-zip
		if ( $is_encoded ) {
			$valid_svg = $this->encode_svg( $valid_svg );
		}
		file_put_contents( $filename, $valid_svg );

		return true;
	}

	/**
	 * Validate File
	 *
	 * @since 3.3.0
	 * @access public
	 *
	 * @param $file
	 * @return bool|\WP_Error
	 */
	public function validate_file( $file ) {
		if ( ! $this->sanitize_svg( $file['tmp_name'] ) ) {
			return new \WP_Error( Exceptions::FORBIDDEN, esc_html__( 'This file is not allowed for security reasons.', 'elementor' ) );
		}

		return true;
	}

	/**
	 * Sanitizer
	 *
	 * @since 3.5.0
	 * @access public
	 *
	 * @param $content
	 * @return bool|string
	 */
	public function sanitizer( $content ) {
		// Strip php tags
		$content = $this->strip_comments( $content );
		$content = $this->strip_php_tags( $content );
		$content = $this->strip_line_breaks( $content );

		// Find the start and end tags so we can cut out miscellaneous garbage.
		$start = strpos( $content, '<svg' );
		$end = strrpos( $content, '</svg>' );
		if ( false === $start || false === $end ) {
			return false;
		}

		$content = substr( $content, $start, ( $end - $start + 6 ) );

		// If the server's PHP version is 8 or up, make sure to Disable the ability to load external entities
		$php_version_under_eight = version_compare( PHP_VERSION, '8.0.0', '<' );
		if ( $php_version_under_eight ) {
			$libxml_disable_entity_loader = libxml_disable_entity_loader( true ); // phpcs:ignore Generic.PHP.DeprecatedFunctions.Deprecated
		}
		// Suppress the errors
		$libxml_use_internal_errors = libxml_use_internal_errors( true );

		// Create DomDocument instance
		$this->svg_dom = new \DOMDocument();
		$this->svg_dom->formatOutput = false;
		$this->svg_dom->preserveWhiteSpace = false;
		$this->svg_dom->strictErrorChecking = false;

		$open_svg = $this->svg_dom->loadXML( $content );
		if ( ! $open_svg ) {
			return false;
		}

		$this->strip_doctype();
		$this->sanitize_elements();

		// Export sanitized svg to string
		// Using documentElement to strip out <?xml version="1.0" encoding="UTF-8"...
		$sanitized = $this->svg_dom->saveXML( $this->svg_dom->documentElement, LIBXML_NOEMPTYTAG );

		// Restore defaults
		if ( $php_version_under_eight ) {
			libxml_disable_entity_loader( $libxml_disable_entity_loader ); // phpcs:ignore Generic.PHP.DeprecatedFunctions.Deprecated
		}
		libxml_use_internal_errors( $libxml_use_internal_errors );

		return $sanitized;
	}

	/**
	 * WP Prepare Attachment For J
	 *
	 * Runs on the `wp_prepare_attachment_for_js` filter.
	 *
	 * @since 3.5.0
	 * @access public
	 *
	 * @param $attachment_data
	 * @param $attachment
	 * @param $meta
	 *
	 * @return mixed
	 */
	public function wp_prepare_attachment_for_js( $attachment_data, $attachment, $meta ) {
		if ( 'image' !== $attachment_data['type'] || 'svg+xml' !== $attachment_data['subtype'] || ! class_exists( 'SimpleXMLElement' ) ) {
			return $attachment_data;
		}

		$svg = self::get_inline_svg( $attachment->ID );

		if ( ! $svg ) {
			return $attachment_data;
		}

		try {
			$svg = new \SimpleXMLElement( $svg );
		} catch ( \Exception $e ) {
			return $attachment_data;
		}

		$src = $attachment_data['url'];
		$width = (int) $svg['width'];
		$height = (int) $svg['height'];

		// Media Gallery
		$attachment_data['image'] = compact( 'src', 'width', 'height' );
		$attachment_data['thumb'] = compact( 'src', 'width', 'height' );

		// Single Details of Image
		$attachment_data['sizes']['full'] = [
			'height' => $height,
			'width' => $width,
			'url' => $src,
			'orientation' => $height > $width ? 'portrait' : 'landscape',
		];
		return $attachment_data;
	}

	/**
	 * Set Svg Meta Data
	 *
	 * Adds dimensions metadata to uploaded SVG files, since WordPress doesn't do it.
	 *
	 * @since 3.5.0
	 * @access public
	 *
	 * @return mixed
	 */
	public function set_svg_meta_data( $data, $id ) {
		$attachment = get_post( $id ); // Filter makes sure that the post is an attachment.
		$mime_type = $attachment->post_mime_type;

		// If the attachment is an svg
		if ( 'image/svg+xml' === $mime_type ) {
			// If the svg metadata are empty or the width is empty or the height is empty.
			// then get the attributes from xml.
			if ( empty( $data ) || empty( $data['width'] ) || empty( $data['height'] ) ) {
				$attachment = wp_get_attachment_url( $id );
				$xml = simplexml_load_file( $attachment );

				if ( ! empty( $xml ) ) {
					$attr = $xml->attributes();
					$view_box = explode( ' ', $attr->viewBox );// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
					$data['width'] = isset( $attr->width ) && preg_match( '/\d+/', $attr->width, $value ) ? (int) $value[0] : ( 4 === count( $view_box ) ? (int) $view_box[2] : null );
					$data['height'] = isset( $attr->height ) && preg_match( '/\d+/', $attr->height, $value ) ? (int) $value[0] : ( 4 === count( $view_box ) ? (int) $view_box[3] : null );
				}
			}
		}

		return $data;
	}

	/**
	 * Delete Meta Cache
	 *
	 * Deletes the Inline SVG post meta entry.
	 *
	 * @since 3.5.0
	 * @access public
	 */
	public function delete_meta_cache() {
		delete_post_meta_by_key( self::META_KEY );
	}

	/**
	 * File Sanitizer Can Run
	 *
	 * Checks if the classes required for the file sanitizer are in memory.
	 *
	 * @since 3.5.0
	 * @access public
	 * @static
	 *
	 * @return bool
	 */
	public static function file_sanitizer_can_run() {
		return class_exists( 'DOMDocument' ) && class_exists( 'SimpleXMLElement' );
	}

	/**
	 * Get Inline SVG
	 *
	 * @since 3.5.0
	 * @access public
	 * @static
	 *
	 * @param $attachment_id
	 * @return bool|mixed|string
	 */
	public static function get_inline_svg( $attachment_id ) {
		$svg = get_post_meta( $attachment_id, self::META_KEY, true );

		if ( ! empty( $svg ) ) {
			return $svg;
		}

		$attachment_file = get_attached_file( $attachment_id );

		if ( ! $attachment_file ) {
			return '';
		}

		$svg = file_get_contents( $attachment_file );

		if ( ! empty( $svg ) ) {
			update_post_meta( $attachment_id, self::META_KEY, $svg );
		}

		return $svg;
	}

	/**
	 * Is Encoded
	 *
	 * Check if the contents of the SVG file are gzipped
	 * @see http://www.gzip.org/zlib/rfc-gzip.html#member-format
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $contents
	 *
	 * @return bool
	 */
	private function is_encoded( $contents ) {
		$needle = "\x1f\x8b\x08";
		if ( function_exists( 'mb_strpos' ) ) {
			return 0 === mb_strpos( $contents, $needle );
		} else {
			return 0 === strpos( $contents, $needle );
		}
	}

	/**
	 * Encode SVG
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $content
	 * @return string
	 */
	private function encode_svg( $content ) {
		return gzencode( $content );
	}

	/**
	 * Decode SVG
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $content
	 *
	 * @return string
	 */
	private function decode_svg( $content ) {
		return gzdecode( $content );
	}

	/**
	 * Is Allowed Tag
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $element
	 * @return bool
	 */
	private function is_allowed_tag( $element ) {
		static $allowed_tags = false;
		if ( false === $allowed_tags ) {
			$allowed_tags = $this->get_allowed_elements();
		}

		$tag_name = $element->tagName; // phpcs:ignore -- php DomDocument

		if ( ! in_array( strtolower( $tag_name ), $allowed_tags ) ) {
			$this->remove_element( $element );
			return false;
		}

		return true;
	}

	/**
	 * Remove Element
	 *
	 * Removes the passed element from its DomDocument tree
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $element
	 */
	private function remove_element( $element ) {
		$element->parentNode->removeChild( $element ); // phpcs:ignore -- php DomDocument
	}

	/**
	 * Is It An Attribute
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $name
	 * @param $check
	 * @return bool
	 */
	private function is_a_attribute( $name, $check ) {
		return 0 === strpos( $name, $check . '-' );
	}

	/**
	 * Is Remote Value
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $value
	 * @return string
	 */
	private function is_remote_value( $value ) {
		$value = trim( preg_replace( '/[^ -~]/xu', '', $value ) );
		$wrapped_in_url = preg_match( '~^url\(\s*[\'"]\s*(.*)\s*[\'"]\s*\)$~xi', $value, $match );
		if ( ! $wrapped_in_url ) {
			return false;
		}

		$value = trim( $match[1], '\'"' );
		return preg_match( '~^((https?|ftp|file):)?//~xi', $value );
	}

	/**
	 * Has JS Value
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $value
	 * @return false|int
	 */
	private function has_js_value( $value ) {
		return preg_match( '/base64|data|(?:java)?script|alert\(|window\.|document/i', $value );
	}

	/**
	 * Get Allowed Attributes
	 *
	 * Returns an array of allowed tag attributes in SVG files.
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @return array
	 */
	private function get_allowed_attributes() {
		$allowed_attributes = [
			'class',
			'clip-path',
			'clip-rule',
			'fill',
			'fill-opacity',
			'fill-rule',
			'filter',
			'id',
			'mask',
			'opacity',
			'stroke',
			'stroke-dasharray',
			'stroke-dashoffset',
			'stroke-linecap',
			'stroke-linejoin',
			'stroke-miterlimit',
			'stroke-opacity',
			'stroke-width',
			'style',
			'systemlanguage',
			'transform',
			'href',
			'xlink:href',
			'xlink:title',
			'cx',
			'cy',
			'r',
			'requiredfeatures',
			'clippathunits',
			'type',
			'rx',
			'ry',
			'color-interpolation-filters',
			'stddeviation',
			'filterres',
			'filterunits',
			'height',
			'primitiveunits',
			'width',
			'x',
			'y',
			'font-size',
			'display',
			'font-family',
			'font-style',
			'font-weight',
			'text-anchor',
			'marker-end',
			'marker-mid',
			'marker-start',
			'x1',
			'x2',
			'y1',
			'y2',
			'gradienttransform',
			'gradientunits',
			'spreadmethod',
			'markerheight',
			'markerunits',
			'markerwidth',
			'orient',
			'preserveaspectratio',
			'refx',
			'refy',
			'viewbox',
			'maskcontentunits',
			'maskunits',
			'd',
			'patterncontentunits',
			'patterntransform',
			'patternunits',
			'points',
			'fx',
			'fy',
			'offset',
			'stop-color',
			'stop-opacity',
			'xmlns',
			'xmlns:se',
			'xmlns:xlink',
			'xml:space',
			'method',
			'spacing',
			'startoffset',
			'dx',
			'dy',
			'rotate',
			'textlength',
		];

		/**
		 * Allowed attributes in SVG file.
		 *
		 * Filters the list of allowed attributes in SVG files.
		 *
		 * Since SVG files can run JS code that may inject malicious code, all attributes
		 * are removed except the allowed attributes.
		 *
		 * This hook can be used to manage allowed SVG attributes. To either add new
		 * attributes or delete existing attributes. To strengthen or weaken site security.
		 *
		 * @param array $allowed_attributes A list of allowed attributes.
		 */
		$allowed_attributes = apply_filters( 'elementor/files/svg/allowed_attributes', $allowed_attributes );

		return $allowed_attributes;
	}

	/**
	 * Get Allowed Elements
	 *
	 * Returns an array of allowed element tags to be in SVG files.
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @return array
	 */
	private function get_allowed_elements() {
		$allowed_elements = [
			'a',
			'circle',
			'clippath',
			'defs',
			'style',
			'desc',
			'ellipse',
			'fegaussianblur',
			'filter',
			'foreignobject',
			'g',
			'image',
			'line',
			'lineargradient',
			'marker',
			'mask',
			'metadata',
			'path',
			'pattern',
			'polygon',
			'polyline',
			'radialgradient',
			'rect',
			'stop',
			'svg',
			'switch',
			'symbol',
			'text',
			'textpath',
			'title',
			'tspan',
			'use',
		];

		/**
		 * Allowed elements in SVG file.
		 *
		 * Filters the list of allowed elements in SVG files.
		 *
		 * Since SVG files can run JS code that may inject malicious code, all elements
		 * are removed except the allowed elements.
		 *
		 * This hook can be used to manage SVG elements. To either add new elements or
		 * delete existing elements. To strengthen or weaken site security.
		 *
		 * @param array $allowed_elements A list of allowed elements.
		 */
		$allowed_elements = apply_filters( 'elementor/files/svg/allowed_elements', $allowed_elements );

		return $allowed_elements;
	}

	/**
	 * Validate Allowed Attributes
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param \DOMElement $element
	 */
	private function validate_allowed_attributes( $element ) {
		static $allowed_attributes = false;
		if ( false === $allowed_attributes ) {
			$allowed_attributes = $this->get_allowed_attributes();
		}

		for ( $index = $element->attributes->length - 1; $index >= 0; $index-- ) {
			// get attribute name
			$attr_name = $element->attributes->item( $index )->name;
			$attr_name_lowercase = strtolower( $attr_name );
			// Remove attribute if not in whitelist
			if ( ! in_array( $attr_name_lowercase, $allowed_attributes ) && ! $this->is_a_attribute( $attr_name_lowercase, 'aria' ) && ! $this->is_a_attribute( $attr_name_lowercase, 'data' ) ) {
				$element->removeAttribute( $attr_name );
				continue;
			}

			$attr_value = $element->attributes->item( $index )->value;

			// Remove attribute if it has a remote reference or js or data-URI/base64
			if ( ! empty( $attr_value ) && ( $this->is_remote_value( $attr_value ) || $this->has_js_value( $attr_value ) ) ) {
				$element->removeAttribute( $attr_name );
				continue;
			}
		}
	}

	/**
	 * Strip xlinks
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param \DOMElement $element
	 */
	private function strip_xlinks( $element ) {
		$xlinks = $element->getAttributeNS( 'http://www.w3.org/1999/xlink', 'href' );

		if ( ! $xlinks ) {
			return;
		}

		$allowed_links = [
			'data:image/png', // PNG
			'data:image/gif', // GIF
			'data:image/jpg', // JPG
			'data:image/jpe', // JPEG
			'data:image/pjp', // PJPEG
		];
		if ( 1 === preg_match( self::SCRIPT_REGEX, $xlinks ) ) {
			if ( ! in_array( substr( $xlinks, 0, 14 ), $allowed_links, true ) ) {
				$element->removeAttributeNS( 'http://www.w3.org/1999/xlink', 'href' );
			}
		}
	}

	/**
	 * Validate Use Tag
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $element
	 */
	private function validate_use_tag( $element ) {
		$xlinks = $element->getAttributeNS( 'http://www.w3.org/1999/xlink', 'href' );
		if ( $xlinks && '#' !== substr( $xlinks, 0, 1 ) ) {
			$element->parentNode->removeChild( $element ); // phpcs:ignore -- php DomNode
		}
	}

	/**
	 * Strip Doctype
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 */
	private function strip_doctype() {
		foreach ( $this->svg_dom->childNodes as $child ) {
			if ( XML_DOCUMENT_TYPE_NODE === $child->nodeType ) { // phpcs:ignore -- php DomDocument
				$child->parentNode->removeChild( $child ); // phpcs:ignore -- php DomDocument
			}
		}
	}

	/**
	 * Sanitize Elements
	 *
	 * @since 3.5.0
	 * @access private
	 */
	private function sanitize_elements() {
		$elements = $this->svg_dom->getElementsByTagName( '*' );
		// loop through all elements
		// we do this backwards so we don't skip anything if we delete a node
		// see comments at: http://php.net/manual/en/class.domnamednodemap.php
		for ( $index = $elements->length - 1; $index >= 0; $index-- ) {
			/**
			 * @var \DOMElement $current_element
			 */
			$current_element = $elements->item( $index );
			// If the tag isn't in the whitelist, remove it and continue with next iteration
			if ( ! $this->is_allowed_tag( $current_element ) ) {
				continue;
			}

			//validate element attributes
			$this->validate_allowed_attributes( $current_element );

			$this->strip_xlinks( $current_element );

			if ( 'use' === strtolower( $current_element->tagName ) ) { // phpcs:ignore -- php DomDocument
				$this->validate_use_tag( $current_element );
			}
		}
	}

	/**
	 * Strip PHP Tags
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $string
	 * @return string
	 */
	private function strip_php_tags( $string ) {
		$string = preg_replace( '/<\?(=|php)(.+?)\?>/i', '', $string );
		// Remove XML, ASP, etc.
		$string = preg_replace( '/<\?(.*)\?>/Us', '', $string );
		$string = preg_replace( '/<\%(.*)\%>/Us', '', $string );

		if ( ( false !== strpos( $string, '<?' ) ) || ( false !== strpos( $string, '<%' ) ) ) {
			return '';
		}
		return $string;
	}

	/**
	 * Strip Comments
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $string
	 * @return string
	 */
	private function strip_comments( $string ) {
		// Remove comments.
		$string = preg_replace( '/<!--(.*)-->/Us', '', $string );
		$string = preg_replace( '/\/\*(.*)\*\//Us', '', $string );
		if ( ( false !== strpos( $string, '<!--' ) ) || ( false !== strpos( $string, '/*' ) ) ) {
			return '';
		}
		return $string;
	}

	/**
	 * Strip Line Breaks
	 *
	 * @since 3.5.0
	 * @access private
	 *
	 * @param $string
	 * @return string
	 */
	private function strip_line_breaks( $string ) {
		// Remove line breaks.
		return preg_replace( '/\r|\n/', '', $string );
	}

	public function __construct() {
		add_filter( 'wp_update_attachment_metadata', [ $this, 'set_svg_meta_data' ], 10, 2 );
		add_filter( 'wp_prepare_attachment_for_js', [ $this, 'wp_prepare_attachment_for_js' ], 10, 3 );
		add_action( 'elementor/core/files/clear_cache', [ $this, 'delete_meta_cache' ] );
	}
}
