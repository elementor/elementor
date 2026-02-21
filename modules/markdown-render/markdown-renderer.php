<?php
namespace Elementor\Modules\MarkdownRender;

use Elementor\Core\Base\Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Renderer {

	public function render( Document $document ): string {
		$frontmatter = $this->build_frontmatter( $document );
		$data = $document->get_elements_data();

		if ( empty( $data ) ) {
			return $frontmatter;
		}

		$sections = [];

		foreach ( $data as $element_data ) {
			$md = $this->render_element( $element_data );

			if ( ! empty( trim( $md ) ) ) {
				$sections[] = $md;
			}
		}

		$body = implode( "\n\n---\n\n", $sections );

		$output = $frontmatter . "\n\n" . $body;

		return apply_filters( 'elementor/markdown/document_output', $output, $document );
	}

	private function build_frontmatter( Document $document ): string {
		$post_id = $document->get_main_id();

		$lines = [ '---' ];
		$lines[] = 'title: "' . $this->escape_yaml_string( get_the_title( $post_id ) ) . '"';

		$description = $this->get_meta_description( $post_id );

		if ( $description ) {
			$lines[] = 'description: "' . $this->escape_yaml_string( $description ) . '"';
		}

		$thumbnail = get_the_post_thumbnail_url( $post_id, 'full' );

		if ( $thumbnail ) {
			$lines[] = 'featured_image: "' . esc_url( $thumbnail ) . '"';
		}

		$lines[] = 'url: "' . get_permalink( $post_id ) . '"';
		$lines[] = 'date_modified: "' . get_the_modified_date( 'c', $post_id ) . '"';
		$lines[] = '---';

		return implode( "\n", $lines );
	}

	private function get_meta_description( int $post_id ): string {
		$description = get_post_meta( $post_id, '_yoast_wpseo_metadesc', true );

		if ( ! empty( $description ) ) {
			return $description;
		}

		$description = get_post_meta( $post_id, '_aioseo_description', true );

		if ( ! empty( $description ) ) {
			return $description;
		}

		$excerpt = get_the_excerpt( $post_id );

		return $excerpt ?: '';
	}

	private function render_element( array $element_data ): string {
		$element = Plugin::$instance->elements_manager->create_element_instance( $element_data );

		if ( ! $element ) {
			return '';
		}

		$markdown = $element->render_markdown();

		return apply_filters( 'elementor/markdown/element_output', $markdown, $element, $element_data );
	}

	private function escape_yaml_string( string $value ): string {
		$value = str_replace( "\xE2\x80\x8B", '', $value );

		return str_replace( [ '"', "\n", "\r" ], [ '\\"', ' ', '' ], $value );
	}
}
