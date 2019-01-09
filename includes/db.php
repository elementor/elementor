<?php
namespace Elementor;

use Elementor\Core\DynamicTags\Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor database.
 *
 * Elementor database handler class is responsible for communicating with the
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
	 * Holds the switched post data.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @var array Switched post data. Default is an empty array.
	 */
	protected $switched_post_data = [];

	/**
	 * Switched data.
	 *
	 * Holds the switched data.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var array Switched data. Default is an empty array.
	 */
	protected $switched_data = [];

	/**
	 * Save editor.
	 *
	 * Save data from the editor to the database.
	 *
	 * @since 1.0.0
	 * @deprecated 2.0.0 Use `Plugin::$instance->documents->save()` method instead.
	 *
	 * @access public
	 *
	 * @param int    $post_id Post ID.
	 * @param array  $data    Post data.
	 * @param string $status  Optional. Post status. Default is `publish`.
	 *
	 * @return bool
	 */
	public function save_editor( $post_id, $data, $status = self::STATUS_PUBLISH ) {
		// TODO: _deprecated_function( __METHOD__, '2.0.0', 'Plugin::$instance->documents->save()' );

		$document = Plugin::$instance->documents->get( $post_id );

		if ( self::STATUS_AUTOSAVE === $status ) {
			$document = $document->get_autosave( 0, true );
		}

		return $document->save( [
			'elements' => $data,
			'settings' => [
				'post_status' => $status,
			],
		] );
	}

	/**
	 * Get builder.
	 *
	 * Retrieve editor data from the database.
	 *
	 * @since 1.0.0
	 *
	 * @access public
	 *
	 * @param int     $post_id           Post ID.
	 * @param string  $status            Optional. Post status. Default is `publish`.
	 *
	 * @return array Editor data.
	 */
	public function get_builder( $post_id, $status = self::STATUS_PUBLISH ) {
		if ( self::STATUS_DRAFT === $status ) {
			$document = Plugin::$instance->documents->get_doc_or_auto_save( $post_id );
		} else {
			$document = Plugin::$instance->documents->get( $post_id );
		}

		if ( $document ) {
			$editor_data = $document->get_elements_raw_data( null, true );
		} else {
			$editor_data = [];
		}

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
	 * @deprecated 2.0.0 Use `Plugin::$instance->documents->get_elements_data()` method instead.
	 *
	 * @access public
	 *
	 * @param int    $post_id Post ID.
	 * @param string $status  Optional. Post status. Default is `publish`.
	 *
	 * @return array Post data.
	 */
	public function get_plain_editor( $post_id, $status = self::STATUS_PUBLISH ) {
		// TODO: _deprecated_function( __METHOD__, '2.0.0', 'Plugin::$instance->documents->get_elements_data()' );

		$document = Plugin::$instance->documents->get( $post_id );

		if ( $document ) {
			return $document->get_elements_data( $status );
		}

		return [];
	}

	/**
	 * Get auto-saved post revision.
	 *
	 * Retrieve the auto-saved post revision that is newer than current post.
	 *
	 * @since 1.9.0
	 * @deprecated 2.0.0 Use `Plugin::$instance->documents->get_newer_autosave()` method instead.
	 *
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return \WP_Post|false The auto-saved post, or false.
	 */
	public function get_newer_autosave( $post_id ) {
		// TODO: _deprecated_function( __METHOD__, '2.0.0', 'Plugin::$instance->documents->get_newer_autosave()' );

		$document = Plugin::$instance->documents->get( $post_id );

		return $document->get_newer_autosave();
	}

	/**
	 * Get new editor from WordPress editor.
	 *
	 * When editing the with Elementor the first time, the current page content
	 * is parsed into Text Editor Widget that contains the original data.
	 *
	 * @since 2.1.0
	 * @deprecated 2.3.0 Use `$document->convert_to_elementor()` instead
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return array Content in Elementor format.
	 */
	public function get_new_editor_from_wp_editor( $post_id ) {
		// TODO: _deprecated_function( __METHOD__, '2.3.0', '$document->convert_to_elementor()' );
		$document = Plugin::$instance->documents->get( $post_id );

		if ( $document ) {
			return $document->convert_to_elementor();
		}

		return [];
	}

	/**
	 * Get new editor from WordPress editor.
	 *
	 * When editing the with Elementor the first time, the current page content
	 * is parsed into Text Editor Widget that contains the original data.
	 *
	 * @since 1.0.0
	 * @deprecated 2.1.0 Use `DB::get_new_editor_from_wp_editor()` instead
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return array Content in Elementor format.
	 */
	public function _get_new_editor_from_wp_editor( $post_id ) {
		// TODO: _deprecated_function( __METHOD__, '2.1.0', __CLASS__ . '::get_new_editor_from_wp_editor()' );

		return $this->get_new_editor_from_wp_editor( $post_id );
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
	 * @since 2.0.0
	 * @access private
	 *
	 * @param array $element_data Element data.
	 */
	private function render_element_plain_content( $element_data ) {
		if ( 'widget' === $element_data['elType'] ) {
			/** @var Widget_Base $widget */
			$widget = Plugin::$instance->elements_manager->create_element_instance( $element_data );

			if ( $widget ) {
				$widget->render_plain_content();
			}
		}

		if ( ! empty( $element_data['elements'] ) ) {
			foreach ( $element_data['elements'] as $element ) {
				$this->render_element_plain_content( $element );
			}
		}
	}

	/**
	 * Save plain text.
	 *
	 * Retrieves the raw content, removes all kind of unwanted HTML tags and saves
	 * the content as the `post_content` field in the database.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 */
	public function save_plain_text( $post_id ) {
		// Switch $dynamic_tags to parsing mode = remove.
		$dynamic_tags = Plugin::$instance->dynamic_tags;
		$parsing_mode = $dynamic_tags->get_parsing_mode();
		$dynamic_tags->set_parsing_mode( Manager::MODE_REMOVE );

		$plain_text = $this->get_plain_text( $post_id );

		wp_update_post(
			[
				'ID' => $post_id,
				'post_content' => $plain_text,
			]
		);

		// Restore parsing mode.
		$dynamic_tags->set_parsing_mode( $parsing_mode );
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
	 * @param array    $args           Array of args pointers for passing parameters in & out of the callback
	 *
	 * @return mixed Iterated data.
	 */
	public function iterate_data( $data_container, $callback, $args = [] ) {
		if ( isset( $data_container['elType'] ) ) {
			if ( ! empty( $data_container['elements'] ) ) {
				$data_container['elements'] = $this->iterate_data( $data_container['elements'], $callback, $args );
			}

			return call_user_func( $callback, $data_container, $args );
		}

		foreach ( $data_container as $element_key => $element_value ) {
			$element_data = $this->iterate_data( $data_container[ $element_key ], $callback, $args );

			if ( null === $element_data ) {
				continue;
			}

			$data_container[ $element_key ] = $element_data;
		}

		return $data_container;
	}

	/**
	 * Safely copy Elementor meta.
	 *
	 * Make sure the original page was built with Elementor and the post is not
	 * auto-save. Only then copy elementor meta from one post to another using
	 * `copy_elementor_meta()`.
	 *
	 * @since 1.9.2
	 * @access public
	 *
	 * @param int $from_post_id Original post ID.
	 * @param int $to_post_id   Target post ID.
	 */
	public function safe_copy_elementor_meta( $from_post_id, $to_post_id ) {
		// It's from  WP-Admin & not from Elementor.
		if ( ! did_action( 'elementor/db/before_save' ) ) {

			if ( ! Plugin::$instance->db->is_built_with_elementor( $from_post_id ) ) {
				return;
			}

			// It's an exited Elementor auto-save
			if ( get_post_meta( $to_post_id, '_elementor_data', true ) ) {
				return;
			}
		}

		$this->copy_elementor_meta( $from_post_id, $to_post_id );
	}

	/**
	 * Copy Elementor meta.
	 *
	 * Duplicate the data from one post to another.
	 *
	 * Consider using `safe_copy_elementor_meta()` method instead.
	 *
	 * @since 1.1.0
	 * @access public
	 *
	 * @param int $from_post_id Original post ID.
	 * @param int $to_post_id   Target post ID.
	 */
	public function copy_elementor_meta( $from_post_id, $to_post_id ) {
		$from_post_meta = get_post_meta( $from_post_id );
		$core_meta = [
			'_wp_page_template',
			'_thumbnail_id',
		];

		foreach ( $from_post_meta as $meta_key => $values ) {
			// Copy only meta with the `_elementor` prefix
			if ( 0 === strpos( $meta_key, '_elementor' ) || in_array( $meta_key, $core_meta, true ) ) {
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
	 * Switch to post.
	 *
	 * Change the global WordPress post to the requested post.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @param int $post_id Post ID to switch to.
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

		$GLOBALS['post'] = get_post( $post_id ); // WPCS: override ok.

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

		$GLOBALS['post'] = get_post( $data['original_id'] ); // WPCS: override ok.

		setup_postdata( $GLOBALS['post'] );
	}


	/**
	 * Switch to query.
	 *
	 * Change the WordPress query to a new query with the requested
	 * query variables.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @param array $query_vars New query variables.
	 * @param bool  $force_global_post
	 */
	public function switch_to_query( $query_vars, $force_global_post = false ) {
		global $wp_query;
		$current_query_vars = $wp_query->query;

		// If is already switched, or is the same query, return.
		if ( $current_query_vars === $query_vars ) {
			$this->switched_data[] = false;
			return;
		}

		$new_query = new \WP_Query( $query_vars );

		$switched_data = [
			'switched' => $new_query,
			'original' => $wp_query,
		];

		if ( ! empty( $GLOBALS['post'] ) ) {
			$switched_data['post'] = $GLOBALS['post'];
		}

		$this->switched_data[] = $switched_data;

		$wp_query = $new_query; // WPCS: override ok.

		// Ensure the global post is set only if needed
		unset( $GLOBALS['post'] );

		if ( isset( $new_query->posts[0] ) ) {
			if ( $force_global_post || $new_query->is_singular() ) {
				$GLOBALS['post'] = $new_query->posts[0]; // WPCS: override ok.
				setup_postdata( $GLOBALS['post'] );
			}
		}

		if ( $new_query->is_author() ) {
			$GLOBALS['authordata'] = get_userdata( $new_query->get( 'author' ) ); // WPCS: override ok.
		}
	}

	/**
	 * Restore current query.
	 *
	 * Rollback to the previous query, rolling back from `DB::switch_to_query()`.
	 *
	 * @since 2.0.0
	 * @access public
	 */
	public function restore_current_query() {
		$data = array_pop( $this->switched_data );

		// If not switched, return.
		if ( ! $data ) {
			return;
		}

		global $wp_query;

		$wp_query = $data['original']; // WPCS: override ok.

		// Ensure the global post/authordata is set only if needed.
		unset( $GLOBALS['post'] );
		unset( $GLOBALS['authordata'] );

		if ( ! empty( $data['post'] ) ) {
			$GLOBALS['post'] = $data['post']; // WPCS: override ok.
			setup_postdata( $GLOBALS['post'] );
		}

		if ( $wp_query->is_author() ) {
			$GLOBALS['authordata'] = get_userdata( $wp_query->get( 'author' ) ); // WPCS: override ok.
		}
	}

	/**
	 * Get plain text.
	 *
	 * Retrieve the post plain text.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return string Post plain text.
	 */
	public function get_plain_text( $post_id ) {
		$data = $this->get_plain_editor( $post_id );

		return $this->get_plain_text_from_data( $data );
	}

	/**
	 * Get plain text from data.
	 *
	 * Retrieve the post plain text from any given Elementor data.
	 *
	 * @since 1.9.2
	 * @access public
	 *
	 * @param array $data Post ID.
	 *
	 * @return string Post plain text.
	 */
	public function get_plain_text_from_data( $data ) {
		ob_start();
		if ( $data ) {
			foreach ( $data as $element_data ) {
				$this->render_element_plain_content( $element_data );
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
