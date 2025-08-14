<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/autoloader.php';
require_once __DIR__ . '/schema-mapping.php';
require_once __DIR__ . '/widget-creation.php';
require_once __DIR__ . '/widgets/flexbox-widget-handler.php';
require_once __DIR__ . '/widgets/paragraph-widget-handler.php';
require_once __DIR__ . '/widgets/html-widget-handler.php';

// Initialize CSS parser dependencies
CSS_Converter_Autoloader::register();

class CssConverterHandler {
    private $widget_handlers;

    public function __construct() {
        $this->widget_handlers = [
            'flexbox' => new \Elementor\Modules\CssConverter\Widgets\Flexbox_Widget_Handler(),
            'paragraph' => new \Elementor\Modules\CssConverter\Widgets\Paragraph_Widget_Handler(),
            'html' => new \Elementor\Modules\CssConverter\Widgets\Html_Widget_Handler(),
        ];
    }

    public function handle_request( $request ) {
		$body = $request->get_body();
		$data = json_decode( $body, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return [
				'error' => 'Invalid JSON',
				'details' => json_last_error_msg(),
			];
		}
		if ( ! isset( $data['elements'] ) || ! is_array( $data['elements'] ) ) {
			return [
				'error' => 'Missing or invalid elements array',
			];
		}
        // SECURITY NOTE: Consider validating/sanitizing payload fields and enforcing capabilities.
        $post_id = isset( $data['postId'] ) ? $data['postId'] : null;
        $post_type = isset( $data['postType'] ) ? $data['postType'] : 'page';
        $parent_container_id = isset( $data['parentContainerId'] ) ? $data['parentContainerId'] : null;

		$results = [];
        foreach ( $data['elements'] as $element ) {
            $handler = $this->resolve_handler( $element );
			$results[] = $handler->handle( $element );
		}
        return elementor_css_converter_create_widgets( $results, $post_id, $post_type, $parent_container_id );
	}

    private function resolve_handler( $element ) {
		$tag = isset( $element['tag'] ) ? $element['tag'] : null;
        if ( in_array( $tag, [ 'div', 'header', 'section', 'article', 'aside', 'footer' ], true ) ) {
            return $this->widget_handlers['flexbox'];
        } elseif ( 'p' === $tag ) {
            return $this->widget_handlers['paragraph'];
		} else {
            return $this->widget_handlers['html'];
		}
	}
}
