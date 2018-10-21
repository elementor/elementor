<?php
namespace Elementor\Core\Files\Svg;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Svg_Handler {

	/**
	 * Inline svg attachment meta key
	 */
	const META_KEY = '_elementor_inline_svg';

	const MIME_TYPE = 'image/svg+xml';

	const SCRIPT_REGEX = '/(?:\w+script|data):/xi';

	/**
	 * @var \DOMDocument
	 */
	private $svg_dom = null;

	/**
	 * Attachment ID.
	 *
	 * Holds the current attachment ID.
	 *
	 * @var int
	 */
	private $attachment_id;

	public static function get_name() {
		return 'svg-handler';
	}

	public function set_attachment_id( $attachment_id ) {
		return $this->attachment_id = $attachment_id;
	}


	public function get_attachment_id() {
		return $this->attachment_id;
	}

	protected function get_meta() {
		return get_post_meta( $this->attachment_id, self::META_KEY, true );
	}

	protected function update_meta( $meta ) {
		update_post_meta( $this->attachment_id, self::META_KEY, $meta );
	}

	protected function delete_meta() {
		delete_post_meta( $this->attachment_id, self::META_KEY );
	}

	public function delete_meta_cache() {
		delete_post_meta_by_key( self::META_KEY );
	}

	public function read_from_file( ) {
		return file_get_contents( get_attached_file( $this->attachment_id ) );
	}

	public static function get_inline_svg( $attachment_id ) {
		$svg = get_post_meta( $attachment_id, self::META_KEY, true );
		if ( ! empty( $svg ) ) {
			return $svg;
		}

		$svg = file_get_contents( get_attached_file( $attachment_id ) );
		if ( ! empty( $svg ) ) {
			update_post_meta( $attachment_id, self::META_KEY, $svg );
		}

		return $svg;
	}

	public function upload_mimes( $allowed_types ) {
		if ( $this->is_elementor_media_upload() ) {
			$allowed_types['svg'] = self::MIME_TYPE;
		}
		return $allowed_types;
	}

	public function wp_handle_upload_prefilter( $file ) {
		if ( ! $this->is_elementor_media_upload() || self::MIME_TYPE !== $file['type'] ) {
			return $file;
		}

		if ( ! $this->sanitize_svg( $file['tmp_name'] ) ) {
			$file['error'] = __( 'Invalid SVG Format, file not uploaded for security reasons', 'elementor' );
		}

		return $file;
	}

	private function is_elementor_media_upload() {
		return isset( $_POST['uploadTypeCaller'] ) && 'elementor-editor-upload' === $_POST['uploadTypeCaller'];
	}

	/**
	 * A workaround for upload validation which relies on a PHP extension (fileinfo)
	 * with inconsistent reporting behaviour.
	 * ref: https://core.trac.wordpress.org/ticket/39550
	 * ref: https://core.trac.wordpress.org/ticket/40175
	 */
	public function wp_check_filetype_and_ext( $data, $file, $filename, $mimes ) {
		if ( ! empty( $data['ext'] ) && ! empty( $data['type'] ) ) {
			return $data;
		}

		$filetype = wp_check_filetype( $filename, $mimes );

		if ( 'svg' === $filetype['ext'] ) {
			$data['ext'] = 'svg';
			$data['type'] = self::MIME_TYPE;
		}

		return $data;
	}

	/**
	 * Check if the contents are gzipped
	 * @see http://www.gzip.org/zlib/rfc-gzip.html#member-format
	 *
	 * @param $contents
	 * @return bool
	 */
	private function is_encoded( $contents ) {
		if ( function_exists( 'mb_strpos' ) ) {
			return 0 === mb_strpos( $contents, "\x1f" . "\x8b" . "\x08" );
		} else {
			return 0 === strpos( $contents, "\x1f" . "\x8b" . "\x08" );
		}
	}

	private function decode_svg( $content ) {
		return gzdecode( $content );
	}

	private function encode_svg( $content ) {
		return gzencode( $content );
	}

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

	private function is_allowed_tag( $element ) {
		static $allowed_tags = false;
		if ( false === $allowed_tags ) {
			$allowed_tags = $this->get_allowed_elements();
		}

		if ( ! in_array( strtolower( $element->tagName ), $allowed_tags ) ) {
			$element->parentNode->removeChild( $element );
			return false;
		}
		return true;
	}

	private function is_a_attribute( $name, $check ) {
		return 0 === strpos( $name, $check . '-' );
	}

	private function is_remote_value( $value ) {
		$value = trim( preg_replace( '/[^ -~]/xu','', $value ) );
		$wrapped_in_url = preg_match( '~^url\(\s*[\'"]\s*(.*)\s*[\'"]\s*\)$~xi', $value,  $match );
		if ( ! $wrapped_in_url ) {
			return false;
		}

		$value = trim( $match[1], '\'"' );
		return preg_match( '~^((https?|ftp|file):)?//~xi', $value );
	}

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

		return apply_filters( 'elementor/files/svg/allowed_attributes', $allowed_attributes );
	}

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
		return apply_filters( 'elementor/files/svg/allowed_elements', $allowed_elements );
	}

	private function validate_allowed_attributes( $element ) {
		static $allowed_attributes = false;
		if ( false === $allowed_attributes ) {
			$allowed_attributes = $this->get_allowed_attributes();
		}

		for ( $x = $element->attributes->length - 1; $x >= 0; $x-- ) {
			// get attribute name
			$attr_name = $element->attributes->item($x)->name;
			$attr_name_lowercase = strtolower( $attr_name );
			// Remove attribute if not in whitelist
			if ( ! in_array( $attr_name_lowercase, $allowed_attributes ) && ! $this->is_a_attribute( $attr_name_lowercase, 'aria' ) && ! $this->is_a_attribute( $attr_name_lowercase, 'data' ) ) {
				$element->removeAttribute( $attr_name );
			}

			// Remove attribute if it has a remote reference
			if ( isset( $element->attributes->item( $x )->value ) && $this->is_remote_value( $element->attributes->item( $x )->value ) ) {
				$element->removeAttribute( $attr_name );
			}
		}
	}

	private function strip_xlinks( $element ) {
		$xlinks = $element->getAttributeNS( 'http://www.w3.org/1999/xlink', 'href' );
		$allowed_links = [
			'data:image/png', // PNG
			'data:image/gif', // GIF
			'data:image/jpg', // JPG
			'data:image/jpe', // JPEG
			'data:image/pjp', // PJPEG
		];
		if ( 1 === preg_match( self::SCRIPT_REGEX, $xlinks ) ) {
			if ( ! in_array( substr( $xlinks, 0, 14 ), $allowed_links ) ) {
				$element->removeAttributeNS( 'http://www.w3.org/1999/xlink', 'href' );
			}
		}
	}

	private function validate_use_tag( $element ) {
		$xlinks = $element->getAttributeNS('http://www.w3.org/1999/xlink', 'href');
		if ( $xlinks && '#' !== substr( $xlinks, 0, 1 ) ) {
			$element->parentNode->removeChild( $element );
		}
	}

	private function strip_docktype() {
		foreach ( $this->svg_dom->childNodes as $child ) {
			if ( $child->nodeType === XML_DOCUMENT_TYPE_NODE ) {
				$child->parentNode->removeChild( $child );
			}
		}
	}

	public function strip_php_tags( $string ) {
		$string = preg_replace( '/<\?(=|php)(.+?)\?>/i', '', $string );
		// Remove XML, ASP, etc.
		$string = preg_replace( '/<\?(.*)\?>/Us', '', $string );
		$string = preg_replace( '/<\%(.*)\%>/Us', '', $string );

		if ( ( false !== strpos( $string, '<?' ) ) || ( false !== strpos( $string, '<%' ) ) ) {
			return '';
		}
		return $string;
	}

	public function strip_comments( $string ) {
		// Remove comments.
		$string = preg_replace( '/<!--(.*)-->/Us', '', $string );
		$string = preg_replace( '/\/\*(.*)\*\//Us', '', $string );
		if ( ( false !== strpos( $string, '<!--' ) ) || ( false !== strpos( $string, '/*' ) ) ) {
			return '';
		}
		return $string;
	}

	public function sanitize_elements() {
		$elements = $this->svg_dom->getElementsByTagName( '*' );
		// loop through all elements
		// we do this backwards so we don't skip anything if we delete a node
		// see comments at: http://php.net/manual/en/class.domnamednodemap.php
		for ($i = $elements->length - 1; $i >= 0; $i--) {
			$current_element = $elements->item( $i );
			// If the tag isn't in the whitelist, remove it and continue with next iteration
			if ( ! $this->is_allowed_tag( $current_element ) ) {
				continue;
			}

			//validate element attributes
			$this->validate_allowed_attributes( $current_element );

			$this->strip_xlinks( $current_element );

			$href = $current_element->getAttribute('href');
			if (preg_match(self::SCRIPT_REGEX, $href) === 1) {
				$current_element->removeAttribute('href');
			}

			if ( 'use' === strtolower( $current_element->tagName ) ) {
				$this->validate_use_tag( $current_element );
			}
		}
	}

	public function sanitizer( $content ) {
		// Strip php tags
		$content = $this->strip_php_tags( $content );
		$content = $this->strip_comments( $content );

		// Find the start and end tags so we can cut out miscellaneous garbage.
		$start = strpos( $content, '<svg' );
		$end = strrpos( $content, '</svg>' );
		if ( false === $start || false === $end ) {
			return false;
		}

		$content = substr( $content, $start, ( $end - $start + 6 ) );

		// Make sure to Disable the ability to load external entities
		$libxml_disable_entity_loader = libxml_disable_entity_loader( true );
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

		$this->strip_docktype();
		$this->sanitize_elements();

		// Export sanitized svg to string
		// Using documentElement to strip out <?xml version="1.0" encoding="UTF-8"...
		$sanitized = $this->svg_dom->saveXML( $this->svg_dom->documentElement, LIBXML_NOEMPTYTAG );

		// Restore defaults
		libxml_disable_entity_loader( $libxml_disable_entity_loader );
		libxml_use_internal_errors( $libxml_use_internal_errors );

		return $sanitized;
	}

	public function __construct() {
		add_filter( 'upload_mimes', [ $this, 'upload_mimes' ] );
		add_filter( 'wp_handle_upload_prefilter', [ $this, 'wp_handle_upload_prefilter' ] );
		add_filter( 'wp_check_filetype_and_ext', [ $this, 'wp_check_filetype_and_ext' ], 10, 4 );
		add_action( 'elementor/core/files/clear_cache', [ $this, 'delete_meta_cache' ] );
	}
}
