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

	private $_fetch_html_cache = false;

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
	public function save_builder( $post_id, $posted, $revision = self::REVISION_PUBLISH ) {
		$builder_data = $this->_sanitize_saved_data( $posted );

		if ( self::REVISION_PUBLISH === $revision ) {
			$this->remove_draft( $post_id );
			update_post_meta( $post_id, '_elementor_data', $builder_data );
			$this->_save_plain_text( $post_id );
		} else {
			update_post_meta( $post_id, '_elementor_draft_data', $builder_data );
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
		$data = $this->get_plain_builder( $post_id, $revision );

		$this->_fetch_html_cache = true;
		$data = $this->_sanitize_saved_data( $data );
		$this->_fetch_html_cache = false;

		return $data;
	}

	public function get_plain_builder( $post_id, $revision = self::REVISION_PUBLISH ) {
		$data = get_post_meta( $post_id, '_elementor_data', true );
		if ( self::REVISION_DRAFT === $revision ) {
			$draft_data = get_post_meta( $post_id, '_elementor_draft_data', true );

			if ( ! empty( $draft_data ) ) {
				$data = $draft_data;
			}

			if ( empty( $data ) ) {
				$data = $this->_get_new_builder_from_wp_editor( $post_id );
			}
		}
		return $data;
	}

	protected function _get_new_builder_from_wp_editor( $post_id ) {
		$post = get_post( $post_id );
		if ( empty( $post ) || empty( $post->post_content ) ) {
			return [];
		}

		$text_editor_widget_obj = Plugin::instance()->widgets_manager->get_widget( 'text-editor' );

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
								'elType' => $text_editor_widget_obj->get_type(),
								'widgetType' => $text_editor_widget_obj->get_id(),
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

		$data = $this->get_plain_builder( $post_id );
		if ( ! empty( $data ) ) {
			foreach ( $data as $section ) {
				foreach ( $section['elements'] as $column ) {
					foreach ( $column['elements'] as $widget ) {
						if ( empty( $widget['widgetType'] ) )
							continue;

						$widget_obj = Plugin::instance()->widgets_manager->get_widget( $widget['widgetType'] );
						if ( false === $widget_obj )
							continue;

						if ( empty( $widget['settings'] ) ) {
							$widget['settings'] = [];
						}
						$widget['settings'] = $widget_obj->get_parse_values( $widget['settings'] );
						$widget_obj->render_plain_content( $widget['settings'] );
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
	 * Sanitize posted data for Section.
	 *
	 * @since 1.0.0
	 * @param array $posted_section
	 *
	 * @return array|bool
	 */
	private function _sanitize_saved_section( $posted_section ) {
		if ( ! isset( $posted_section['elType'] ) || 'section' !== $posted_section['elType'] ) {
			return false;
		}

		if ( empty( $posted_section['elements'] ) ) {
			return false;
		}

		$section_data = [
			'id' => $posted_section['id'],
			'elType' => $posted_section['elType'],
			'settings' => $posted_section['settings'],
			'elements' => [],
			'isInner' => $posted_section['isInner'],
		];

		foreach ( $posted_section['elements'] as $posted_column ) {
			$column_data = $this->_sanitize_saved_column( $posted_column );
			if ( ! $column_data ) {
				continue;
			}

			$section_data['elements'][] = $column_data;
		} // End Column

		return $section_data;
	}

	/**
	 * Sanitize posted data for Column.
	 *
	 * @since 1.0.0
	 * @param array $posted_column
	 *
	 * @return array|bool
	 */
	private function _sanitize_saved_column( $posted_column ) {
		if ( ! isset( $posted_column['elType'] ) || 'column' !== $posted_column['elType'] ) {
			return false;
		}

		$column_data = [
			'id' => $posted_column['id'],
			'elType' => $posted_column['elType'],
			'settings' => $posted_column['settings'],
			'elements' => [],
			'isInner' => $posted_column['isInner'],
		];
		foreach ( $posted_column['elements'] as $posted_widget ) {
			$widget_data = $this->_sanitize_saved_widget( $posted_widget );

			if ( ! $widget_data ) {
				continue;
			}
			$column_data['elements'][] = $widget_data;
		} // End Widget

		return $column_data;
	}

	/**
	 * Sanitize posted data for Widget.
	 *
	 * @since 1.0.0
	 * @param array $posted_widget
	 *
	 * @return array|bool
	 */
	private function _sanitize_saved_widget( $posted_widget ) {
		if ( ! isset( $posted_widget['elType'] ) ) {
			return false;
		}

		if ( 'section' === $posted_widget['elType'] ) {
			return $this->_sanitize_saved_section( $posted_widget );
		}

		if ( empty( $posted_widget['widgetType'] ) ) {
			return false;
		}

		$widget_obj = Plugin::instance()->widgets_manager->get_widget( $posted_widget['widgetType'] );
		if ( false === $widget_obj )
			return false;

		$widget_data = [
			'id' => $posted_widget['id'],
			'elType' => $posted_widget['elType'],
			'settings' => $widget_obj->get_parse_values( $posted_widget['settings'] ),
			'widgetType' => $posted_widget['widgetType'],
		];

		if ( $this->_fetch_html_cache ) {
			ob_start();
			$widget_obj->render_content( $widget_data['settings'] );
			$widget_data['htmlCache'] = ob_get_clean();
		}

		// TODO: Validate widget here..
		return $widget_data;
	}

	/**
	 * Sanitize posted data.
	 *
	 * @since 1.0.0
	 * @param array $posted
	 *
	 * @return array
	 */
	private function _sanitize_saved_data( $posted ) {
		$builder_data = [];

		if ( ! empty( $posted ) ) {
			foreach ( $posted as $posted_section ) {
				$section_data = $this->_sanitize_saved_section( $posted_section );

				if ( ! $section_data ) {
					continue;
				}

				$builder_data[] = $section_data;
			} // End Section
		}

		return $builder_data;
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
