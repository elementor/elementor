<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor database class.
 *
 * Elementor database handler class is responsible for comunicating with the
 * DB, save and retrieve Elementor data and meta data.
 *
 * @since 1.0.0
 */
class DB {

	/**
	 * Current DB version of the editor.
	 */
	const DB_VERSION = '0.4';

	/**
	 * Post publish status.
	 */
	const STATUS_PUBLISH = 'publish';

	/**
	 * Post draft status.
	 */
	const STATUS_DRAFT = 'draft';

	/**
	 * Post private status.
	 */
	const STATUS_PRIVATE = 'private';

	/**
	 * Post autosave status.
	 */
	const STATUS_AUTOSAVE = 'autosave';

	/**
	 * Post pending status.
	 */
	const STATUS_PENDING = 'pending';

	/**
	 * Switched post data.
	 *
	 * Holds the post data.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @var array Post data. Default is an empty array.
	 */
	protected $switched_post_data = [];

	/**
	 * Save editor.
	 *
	 * Save data from the editor to the database.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int    $post_id Post ID.
	 * @param array  $data    Post data.
	 * @param string $status  Optional. Post status. Default is `publish`.
	 */
	public function save_editor( $post_id, $data, $status = self::STATUS_PUBLISH ) {
		// Change the global post to current library post, so widgets can use `get_the_ID` and other post data
		$this->switch_to_post( $post_id );

		$editor_data = $this->_get_editor_data( $data );

		// We need the `wp_slash` in order to avoid the unslashing during the `update_post_meta`
		$json_value = wp_slash( wp_json_encode( $editor_data ) );

		$old_autosave = Utils::get_post_autosave( $post_id, get_current_user_id() );
		if ( $old_autosave ) {
			// Force WP to save a new version if the JSON meta was changed.
			// P.S CSS Changes doesn't change the `plain_text.
			wp_delete_post_revision( $old_autosave->ID );
		}

		$save_original = true;

		if ( self::STATUS_AUTOSAVE === $status ) {
			if ( ! defined( 'DOING_AUTOSAVE' ) ) {
				define( 'DOING_AUTOSAVE', true );
			}

			// If the post is a draft - save the `autosave` to the original draft.
			// Allow a revision only if the original post is already published.
			if ( in_array( get_post_status( $post_id ), [ self::STATUS_PUBLISH, self::STATUS_PRIVATE ], true ) ) {
				$save_original = false;
			}
		}

		if ( $save_original ) {
			// Don't use `update_post_meta` that can't handle `revision` post type
			$is_meta_updated = update_metadata( 'post', $post_id, '_elementor_data', $json_value );

			/**
			 * Before DB save.
			 *
			 * Fires before Elementor editor saves data to the database.
			 *
			 * @since 1.0.0
			 *
			 * @param string   $status          Post status.
			 * @param int|bool $is_meta_updated Meta ID if the key didn't exist, true on successful update, false on failure.
			 */
			do_action( 'elementor/db/before_save', $status, $is_meta_updated );

			$this->save_plain_text( $post_id );
		} else {
			/**
			 * Before DB save.
			 *
			 * Fires before Elementor editor saves data to the database.
			 *
			 * @since 1.0.0
			 *
			 * @param string   $status          Post status.
			 * @param int|bool $is_meta_updated Meta ID if the key didn't exist, true on successful update, false on failure.
			 */
			do_action( 'elementor/db/before_save', $status, true );

			$post = get_post( $post_id );

			$autosave_id = wp_create_post_autosave( [
				'post_ID' => $post_id,
				'post_type' => $post->post_type,
				'post_title' => __( 'Auto Save', 'elementor' ) . ' ' . date( 'Y-m-d H:i' ),
				'post_content' => $this->get_plain_text_from_data( $editor_data ),
				'post_modified' => current_time( 'mysql' ),
			] );

			if ( $autosave_id ) {
				update_metadata( 'post', $autosave_id, '_elementor_data', $json_value );
			}
		} // End if().

		update_post_meta( $post_id, '_elementor_version', self::DB_VERSION );

		// Restore global post
		$this->restore_current_post();

		// Remove Post CSS
		delete_post_meta( $post_id, Post_CSS_File::META_KEY );

		/**
		 * After DB save.
		 *
		 * Fires after Elementor editor saves data to the database.
		 *
		 * @since 1.0.0
		 *
		 * @param int   $post_id     The ID of the post.
		 * @param array $editor_data Sanitize posted data.
		 */
		do_action( 'elementor/editor/after_save', $post_id, $editor_data );
	}

	/**
	 * Get builder.
	 *
	 * Retrieve editor data from the database.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int    $post_id Post ID.
	 * @param string $status  Optional. Post status. Default is `publish`.
	 *
	 * @return array Editor data.
	 */
	public function get_builder( $post_id, $status = self::STATUS_PUBLISH ) {
		$data = $this->get_plain_editor( $post_id, $status );

		$this->switch_to_post( $post_id );
		$editor_data = $this->_get_editor_data( $data, true );
		$this->restore_current_post();

		return $editor_data;
	}

	/**
	 * Get JSON meta.
	 *
	 * Retrieve post meta data, and return the JSON decoded data.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @param int    $post_id Post ID.
	 * @param string $key     The meta key to retrieve.
	 *
	 * @return array Decoded JSON data from post meta.
	 */
	protected function _get_json_meta( $post_id, $key ) {
		$meta = get_post_meta( $post_id, $key, true );

		if ( is_string( $meta ) && ! empty( $meta ) ) {
			$meta = json_decode( $meta, true );
		}

		if ( empty( $meta ) ) {
			$meta = [];
		}

		return $meta;
	}

	/**
	 * Get plain editor.
	 *
	 * Retrieve post data that was saved in the database. Raw data before it
	 * was parsed by elementor.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int    $post_id Post ID.
	 * @param string $status  Optional. Post status. Default is `publish`.
	 *
	 * @return array Post data.
	 */
	public function get_plain_editor( $post_id, $status = self::STATUS_PUBLISH ) {
		$data = $this->_get_json_meta( $post_id, '_elementor_data' );

		if ( self::STATUS_DRAFT === $status ) {
			$autosave = $this->get_newer_autosave( $post_id );

			if ( is_object( $autosave ) ) {
				$autosave_data = $this->_get_json_meta( $autosave->ID, '_elementor_data' );
			}
		}

		if ( Plugin::$instance->editor->is_edit_mode() ) {
			if ( empty( $data ) && empty( $autosave_data ) ) {
				$data = $this->_get_new_editor_from_wp_editor( $post_id );
			}
		}

		if ( ! empty( $autosave_data ) ) {
			$data = $autosave_data;
		}

		return $data;
	}

	/**
	 * Get auto-saved post revision.
	 *
	 * Retrieve the auto-saved post revision that is newer than current post.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return \WP_Post|false The auto-saved post, or false.
	 */

	public function get_newer_autosave( $post_id ) {
		$post = get_post( $post_id );

		$autosave = Utils::get_post_autosave( $post_id );

		// Detect if there exists an autosave newer than the post.
		if ( $autosave && mysql2date( 'U', $autosave->post_modified_gmt, false ) > mysql2date( 'U', $post->post_modified_gmt, false ) ) {
			return $autosave;
		}

		return false;
	}

	/**
	 * Get new editor from WordPress editor.
	 *
	 * When editing the with Elementor the first time, the current page content
	 * is parsed into Text Editor Widget that contains the original data.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return array Content in Elementor format.
	 */
	protected function _get_new_editor_from_wp_editor( $post_id ) {
		$post = get_post( $post_id );

		if ( empty( $post ) || empty( $post->post_content ) ) {
			return [];
		}

		$text_editor_widget_type = Plugin::$instance->widgets_manager->get_widget_types( 'text-editor' );

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
								'elType' => $text_editor_widget_type::get_type(),
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
	 * Is using Elementor.
	 *
	 * Set whether the page is using Elementor or not.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @param int  $post_id      Post ID.
	 * @param bool $is_elementor Optional. Whether the page is elementor page.
	 *                           Default is true.
	 */
	public function set_is_elementor_page( $post_id, $is_elementor = true ) {
		if ( $is_elementor ) {
			// Use the string `builder` and not a boolean for rollback compatibility
			update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
		} else {
			delete_post_meta( $post_id, '_elementor_edit_mode' );
		}
	}

	/**
	 * Render element plain content.
	 *
	 * When saving data in the editor, this method renders recursively the plain
	 * content containing only the content and the HTML. No CSS data.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @param array $element_data Element data.
	 */
	private function _render_element_plain_content( $element_data ) {
		if ( 'widget' === $element_data['elType'] ) {
			/** @var Widget_Base $widget */
			$widget = Plugin::$instance->elements_manager->create_element_instance( $element_data );

			if ( $widget ) {
				$widget->render_plain_content();
			}
		}

		if ( ! empty( $element_data['elements'] ) ) {
			foreach ( $element_data['elements'] as $element ) {
				$this->_render_element_plain_content( $element );
			}
		}
	}

	/**
	 * Save plain text.
	 *
	 * Retrives the raw content, removes all kind of unwanted HTML tags and saves
	 * the content as the `post_content` field in the database.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 */
	public function save_plain_text( $post_id ) {
		$plain_text = $this->get_plain_text( $post_id );

		wp_update_post(
			[
				'ID' => $post_id,
				'post_content' => $plain_text,
			]
		);
	}

	/**
	 * Get editor data.
	 *
	 * Accepts raw Elementor data and return parsed data.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @param array $data              Raw Elementor post data from the database.
	 * @param bool  $with_html_content Optional. Whether to return content with
	 *                                 HTML or not. Default is false.
	 *
	 * @return array Parsed data.
	 */
	private function _get_editor_data( $data, $with_html_content = false ) {
		$editor_data = [];

		foreach ( $data as $element_data ) {
			$element = Plugin::$instance->elements_manager->create_element_instance( $element_data );

			if ( ! $element ) {
				continue;
			}

			$editor_data[] = $element->get_raw_data( $with_html_content );
		} // End foreach().

		return $editor_data;
	}

	/**
	 * Iterate data.
	 *
	 * Accept any type of Elementor data and a callback function. The callback
	 * function runs recursively for each element and his child elements.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array    $data_container Any type of elementor data.
	 * @param callable $callback       A function to iterate data by.
	 *
	 * @return mixed Iterated data.
	 */
	public function iterate_data( $data_container, $callback ) {
		if ( isset( $data_container['elType'] ) ) {
			if ( ! empty( $data_container['elements'] ) ) {
				$data_container['elements'] = $this->iterate_data( $data_container['elements'], $callback );
			}

			return $callback( $data_container );
		}

		foreach ( $data_container as $element_key => $element_value ) {
			$element_data = $this->iterate_data( $data_container[ $element_key ], $callback );

			if ( null === $element_data ) {
				continue;
			}

			$data_container[ $element_key ] = $element_data;
		}

		return $data_container;
	}

	/**
	 * @access public
	 */
	public function safe_copy_elementor_meta( $from_post_id, $to_post_id ) {
		if ( ! Plugin::$instance->db->is_built_with_elementor( $from_post_id ) ) {
			return;
		}

		// It's from Elementor, and not from WP-Admin
		if ( did_action( 'elementor/db/before_save' ) ) {
			return;
		}

		// It's an exited Elementor auto-save
		if ( get_post_meta( $to_post_id, '_elementor_data', true ) ) {
			return;
		}

		$this->copy_elementor_meta( $from_post_id, $to_post_id );
	}

	/**
	 * Copy elementor meta.
	 *
	 * Duplicate the data from one post to another.
	 *
	 * @since 1.1.0
	 * @access public
	 *
	 * @param int $from_post_id Original post ID.
	 * @param int $to_post_id   Target post ID.
	 */
	public function copy_elementor_meta( $from_post_id, $to_post_id ) {
		$from_post_meta = get_post_meta( $from_post_id );

		foreach ( $from_post_meta as $meta_key => $values ) {
			// Copy only meta with the `_elementor` prefix
			if ( 0 === strpos( $meta_key, '_elementor' ) ) {
				$value = $values[0];

				// The elementor JSON needs slashes before saving
				if ( '_elementor_data' === $meta_key ) {
					$value = wp_slash( $value );
				} else {
					$value = maybe_unserialize( $value );
				}

				// Don't use `update_post_meta` that can't handle `revision` post type
				update_metadata( 'post', $to_post_id, $meta_key, $value );
			}
		}
	}

	/**
	 * Is built with Elementor.
	 *
	 * Check whether the post was built with Elementor.
	 *
	 * @since 1.0.10
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return bool Whether the post was built with Elementor.
	 */
	public function is_built_with_elementor( $post_id ) {
		return ! ! get_post_meta( $post_id, '_elementor_edit_mode', true );
	}

	/**
	 * Has Elementor in post.
	 *
	 * Check whether the post has Elementor data in the post.
	 *
	 * @since 1.0.10
	 * @access public
	 * @deprecated 1.4.0
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return bool Whether the post was built with Elementor.
	 */
	public function has_elementor_in_post( $post_id ) {
		return $this->is_built_with_elementor( $post_id );
	}

	/**
	 * Switch to post.
	 *
	 * Change the global WordPress post to the requested post.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 */
	public function switch_to_post( $post_id ) {
		$post_id = absint( $post_id );
		// If is already switched, or is the same post, return.
		if ( get_the_ID() === $post_id ) {
			$this->switched_post_data[] = false;
			return;
		}

		$this->switched_post_data[] = [
			'switched_id' => $post_id,
			'original_id' => get_the_ID(), // Note, it can be false if the global isn't set
		];

		$GLOBALS['post'] = get_post( $post_id );
		setup_postdata( $GLOBALS['post'] );
	}

	/**
	 * Restore current post.
	 *
	 * Rollback to the previous global post, rolling back from `DB::switch_to_post()`.
	 *
	 * @since 1.5.0
	 * @access public
	 */
	public function restore_current_post() {
		$data = array_pop( $this->switched_post_data );

		// If not switched, return.
		if ( ! $data ) {
			return;
		}

		// It was switched from an empty global post, restore this state and unset the global post
		if ( false === $data['original_id'] ) {
			unset( $GLOBALS['post'] );
			return;
		}

		$GLOBALS['post'] = get_post( $data['original_id'] );
		setup_postdata( $GLOBALS['post'] );
	}

	/**
	 * @since 1.9.0
	 * @access public
	 */
	public function get_plain_text( $post_id ) {
		$data = $this->get_plain_editor( $post_id );

		return $this->get_plain_text_from_data( $data );
	}

	/**
	 * @access public
	 */
	public function get_plain_text_from_data( $data ) {
		ob_start();
		if ( $data ) {
			foreach ( $data as $element_data ) {
				$this->_render_element_plain_content( $element_data );
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

		$plain_text = trim( $plain_text );

		return $plain_text;
	}
}
