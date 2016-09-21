<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class DB {

	/**
	 * Current DB version of the editor.
	 */
	const DB_VERSION = '0.2';

	const REVISION_PUBLISH = 'publish';

	const REVISION_DRAFT = 'draft';

	/**
	 * Save builder method.
	 *
	 * @since 1.0.0
	 * @param int    $post_id
	 * @param array  $posted
	 * @param string $revision
	 *
	 * @return void
	 */
	public function save_editor( $post_id, $posted, $revision = self::REVISION_PUBLISH ) {
		$editor_data = $this->_get_editor_data( $posted );

		if ( self::REVISION_PUBLISH === $revision ) {
			$this->remove_draft( $post_id );
			update_post_meta( $post_id, '_elementor_data', $editor_data );
			$this->_save_plain_text( $post_id );
		} else {
			update_post_meta( $post_id, '_elementor_draft_data', $editor_data );
		}

		update_post_meta( $post_id, '_elementor_version', self::DB_VERSION );
	}

	/**
	 * Get & Parse the builder from DB.
	 *
	 * @since 1.0.0
	 * @param int    $post_id
	 * @param string $revision
	 *
	 * @return array
	 */
	public function get_builder( $post_id, $revision = self::REVISION_PUBLISH ) {
		$data = $this->get_plain_editor( $post_id, $revision );

		return $this->_get_editor_data( $data, true );
	}

	public function get_plain_editor( $post_id, $revision = self::REVISION_PUBLISH ) {
		$data = get_post_meta( $post_id, '_elementor_data', true );
		if ( self::REVISION_DRAFT === $revision ) {
			$draft_data = get_post_meta( $post_id, '_elementor_draft_data', true );

			if ( ! empty( $draft_data ) ) {
				$data = $draft_data;
			}

			if ( empty( $data ) ) {
				$data = $this->_get_new_editor_from_wp_editor( $post_id );
			}
		}
		return $data;
	}

	protected function _get_new_editor_from_wp_editor( $post_id ) {
		$post = get_post( $post_id );
		if ( empty( $post ) || empty( $post->post_content ) ) {
			return [];
		}

		$text_editor_widget = Plugin::instance()->widgets_manager->get_widget( 'text-editor' );

		/** @var Widget_Text_Editor $text_editor_class */
		$text_editor_class = $text_editor_widget['class'];

		// TODO: Better coding to start template for editor
		return [
			[
				'id' => Utils::generate_random_string(),
				'elType' => 'section',
				'elements' => [
					[
						'id' => Utils::generate_random_string(),
						'elType' => 'column',
						'elements' => [
							[
								'id' => Utils::generate_random_string(),
								'elType' => $text_editor_class::get_type(),
								'widgetType' => $text_editor_widget_type->get_name(),
								'settings' => [
									'editor' => $post->post_content,
								],
							],
						],
					],
				],
			],
		];
	}

	/**
	 * Remove draft data from DB.
	 *
	 * @since 1.0.0
	 * @param $post_id
	 *
	 * @return void
	 */
	public function remove_draft( $post_id ) {
		delete_post_meta( $post_id, '_elementor_draft_data' );
	}

	/**
	 * Get edit mode by Page ID
	 *
	 * @since 1.0.0
	 * @param $post_id
	 *
	 * @return mixed
	 */
	public function get_edit_mode( $post_id ) {
		return get_post_meta( $post_id, '_elementor_edit_mode', true );
	}

	/**
	 * Setup the edit mode per Page ID
	 *
	 * @since 1.0.0
	 * @param int $post_id
	 * @param string $mode
	 *
	 * @return void
	 */
	public function set_edit_mode( $post_id, $mode = 'builder' ) {
		if ( 'builder' === $mode ) {
			update_post_meta( $post_id, '_elementor_edit_mode', $mode );
		} else {
			delete_post_meta( $post_id, '_elementor_edit_mode' );
		}
	}

	private function _save_plain_text( $post_id ) {
		ob_start();

		$data = $this->get_plain_editor( $post_id );
		if ( ! empty( $data ) ) {
			foreach ( $data as $section ) {
				foreach ( $section['elements'] as $column ) {
					foreach ( $column['elements'] as $widget_data ) {
						if ( empty( $widget_data['widgetType'] ) )
							continue;

						$widget_props = Plugin::instance()->widgets_manager->get_widgets( $widget_data['widgetType'] );

						/** @var Widget_Base $widget */
						$widget = new $widget_props['class']( $widget_data );

						$widget->render_plain_content();
					}
				}
			}
		}

		$plain_text = ob_get_clean();

		// Remove unnecessary tags.
		$plain_text = preg_replace( '/<\/?div[^>]*\>/i', '', $plain_text );
		$plain_text = preg_replace( '/<\/?span[^>]*\>/i', '', $plain_text );
		$plain_text = preg_replace( '#<script(.*?)>(.*?)</script>#is', '', $plain_text );
		$plain_text = preg_replace( '/<i [^>]*><\\/i[^>]*>/', '', $plain_text );
		$plain_text = preg_replace( '/ class=".*?"/', '', $plain_text );

		// Remove empty lines.
		$plain_text = preg_replace( '/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/', "\n", $plain_text );

		wp_update_post(
			[
				'ID' => $post_id,
				'post_content' => $plain_text,
			]
		);
	}

	/**
	 * Sanitize posted data.
	 *
	 * @since 1.0.0
	 *
	 * @param array $data
	 *
	 * @param bool $with_html_content
	 *
	 * @return array
	 */
	private function _get_editor_data( $data, $with_html_content = false ) {
		$editor_data = [];

		foreach ( $data as $section_data ) {
			$section = new Element_Section( $section_data );

			$section_data = $section->get_raw_data( $with_html_content );

			if ( ! $section_data ) {
				continue;
			}

			$editor_data[] = $section_data;
		} // End Section

		return $editor_data;
	}

	public function iterate_data( $data_container, $callback ) {
		foreach ( $data_container as $element_key => $element_value ) {
			$data_container[ $element_key ] = $callback( $data_container[ $element_key ] );

			if ( ! empty( $data_container[ $element_key ]['elements'] ) ) {
				$data_container[ $element_key ]['elements'] = $this->iterate_data( $data_container[ $element_key ]['elements'], $callback );
			}
		}

		return $data_container;
	}
}
