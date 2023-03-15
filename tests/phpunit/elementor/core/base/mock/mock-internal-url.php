<?php
namespace Elementor\Testing\Core\Base\Mock;

use Elementor\Core\DynamicTags\Data_Tag;

class Mock_Internal_URL extends Data_Tag {

	public function get_name() {
		return 'internal-url';
	}

	public function get_group() {
		return 'site';
	}

	public function get_categories() {
		return [ 'url' ];
	}

	public function get_title() {
		return esc_html__( 'Internal URL', 'elementor' );
	}

	public function get_panel_template() {
		return ' ({{ url }})';
	}

	public static function on_import_update_dynamic_content( array $config, array $data, $controls = null ) : array {
		if ( isset( $config['settings']['post_id'] ) && isset( $data['post_ids'] ) ) {
			$config['settings']['post_id'] = $data['post_ids'][ $config['settings']['post_id'] ];
		}

		return $config;
	}

	public function get_value( array $options = [] ) {
		$settings = $this->get_settings();

		$type = $settings['type'];
		$url = '';

		if ( 'post' === $type && ! empty( $settings['post_id'] ) ) {
			$url = get_permalink( (int) $settings['post_id'] );
		} elseif ( 'taxonomy' === $type && ! empty( $settings['taxonomy_id'] ) ) {
			$url = get_term_link( (int) $settings['taxonomy_id'] );
		} elseif ( 'attachment' === $type && ! empty( $settings['attachment_id'] ) ) {
			$url = get_attachment_link( (int) $settings['attachment_id'] );
		} elseif ( 'author' === $type && ! empty( $settings['author_id'] ) ) {
			$url = get_author_posts_url( (int) $settings['author_id'] );
		}

		if ( ! is_wp_error( $url ) ) {
			return $url;
		}

		return '';
	}
}
