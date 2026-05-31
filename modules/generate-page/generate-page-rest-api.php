<?php

namespace Elementor\Modules\GeneratePage;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Styles;
use Elementor\Modules\GlobalClasses\Atomic_Global_Styles;
use Elementor\Modules\Interactions\Cache\Interactions_Postmeta;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Generate_Page_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'generate-page';
	const IMPORT_MODE = 'match_site';
	const MAX_DB_CONTENT_LENGTH = 2000000;
	const MAX_CLASSES_CONTENT_LENGTH = 500000;
	const RATE_LIMIT_WINDOW_SECONDS = 30;
	const RATE_LIMIT_MAX_REQUESTS = 5;

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => fn( \WP_REST_Request $request ) => $this->route_wrapper(
					fn() => $this->persist_page( $request )
				),
				'permission_callback' => fn( \WP_REST_Request $request ) => $this->can_persist_page( $request ),
				'args' => [
					'pageTitle' => [
						'type' => 'string',
						'required' => false,
						'validate_callback' => fn( $value ) => is_string( $value ) && '' !== trim( $value ),
					],
					'dbContent' => [
						'type' => 'string',
						'required' => true,
						'validate_callback' => fn( $value ) =>
							is_string( $value ) && strlen( $value ) <= self::MAX_DB_CONTENT_LENGTH,
					],
					'classesContent' => [
						'type' => 'string',
						'required' => false,
						'validate_callback' => fn( $value ) =>
							is_null( $value )
							|| ( is_string( $value ) && strlen( $value ) <= self::MAX_CLASSES_CONTENT_LENGTH ),
					],
					'createNewPage' => [
						'type' => 'boolean',
						'required' => false,
						'default' => false,
					],
					'targetPostId' => [
						'type' => 'integer',
						'required' => false,
						'validate_callback' => fn( $value ) =>
							is_null( $value ) || ( is_numeric( $value ) && 0 < (int) $value ),
					],
				],
			],
		] );
	}

	private function can_persist_page( \WP_REST_Request $request ) {
		if ( $this->should_create_new_page( $request ) ) {
			return current_user_can( 'edit_pages' );
		}

		$target_post_id = absint( $request->get_param( 'targetPostId' ) );
		if ( ! $target_post_id ) {
			return current_user_can( 'edit_posts' );
		}

		return current_user_can( 'edit_post', $target_post_id );
	}

	private function persist_page( \WP_REST_Request $request ) {
		$create_new_page = $this->should_create_new_page( $request );
		$page_title = sanitize_text_field( (string) $request->get_param( 'pageTitle' ) );
		$target_post_id = absint( $request->get_param( 'targetPostId' ) );
		$db_content_raw = (string) $request->get_param( 'dbContent' );
		$classes_content_raw = $request->get_param( 'classesContent' );

		if ( $create_new_page && '' === $page_title ) {
			return new \WP_Error(
				'invalid_page_title',
				__( 'pageTitle must be a non-empty string when creating a new page.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! $create_new_page ) {
			$target_post_error = $this->validate_target_post( $target_post_id );
			if ( is_wp_error( $target_post_error ) ) {
				return $target_post_error;
			}
		}

		$rate_limit_error = $this->assert_rate_limit();
		if ( is_wp_error( $rate_limit_error ) ) {
			return $rate_limit_error;
		}

		$db_content = $this->decode_json_string( $db_content_raw, 'dbContent' );
		if ( is_wp_error( $db_content ) ) {
			return $db_content;
		}

		if ( ! is_array( $db_content ) || empty( $db_content ) ) {
			return new \WP_Error(
				'invalid_db_content',
				__( 'dbContent must be a non-empty JSON array.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$classes_content = null;
		if ( null !== $classes_content_raw && '' !== $classes_content_raw ) {
			$classes_content = $this->decode_json_object_string( (string) $classes_content_raw, 'classesContent' );
			if ( is_wp_error( $classes_content ) ) {
				return $classes_content;
			}
		}

		$processed_content = $this->process_import_content( $db_content, $classes_content );
		if ( is_wp_error( $processed_content ) ) {
			return $processed_content;
		}

		$encoded_content = wp_json_encode( $processed_content );
		if ( false === $encoded_content ) {
			return new \WP_Error(
				'failed_encoding_content',
				__( 'Failed to encode Elementor content.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$post_id = $create_new_page ? $this->create_new_page( $page_title ) : $target_post_id;
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
		if ( $create_new_page ) {
			update_post_meta( $post_id, '_elementor_template_type', 'wp-page' );
		}
		update_post_meta( $post_id, '_elementor_data', wp_slash( $encoded_content ) );
		update_post_meta( $post_id, '_elementor_version', ELEMENTOR_VERSION );

		$this->flush_post_caches( $post_id );

		$document = Plugin::$instance->documents->get( $post_id );
		$view_url = get_permalink( $post_id );
		$edit_url = $document ? $document->get_edit_url() : get_edit_post_link( $post_id, 'raw' );

		return new \WP_REST_Response(
			[
				'postId' => (int) $post_id,
				'viewUrl' => $view_url ?: '',
				'editUrl' => $edit_url ?: '',
			],
			$create_new_page ? \WP_Http::CREATED : \WP_Http::OK
		);
	}

	private function validate_target_post( int $post_id ) {
		if ( ! $post_id ) {
			return new \WP_Error(
				'missing_target_post_id',
				__( 'targetPostId is required unless createNewPage is true.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! get_post( $post_id ) ) {
			return new \WP_Error(
				'invalid_target_post_id',
				__( 'targetPostId must reference an existing post.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error(
				'forbidden_target_post',
				__( 'Sorry, you are not allowed to edit this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return null;
	}

	private function should_create_new_page( \WP_REST_Request $request ): bool {
		return filter_var( $request->get_param( 'createNewPage' ), FILTER_VALIDATE_BOOLEAN );
	}

	private function create_new_page( string $page_title ) {
		$post_status = current_user_can( 'publish_pages' ) ? 'publish' : 'pending';

		return wp_insert_post(
			[
				'post_title' => $page_title,
				'post_status' => $post_status,
				'post_type' => 'page',
			],
			true
		);
	}

	private function process_import_content( array $db_content, ?array $classes_content ) {
		$data = [
			'global_classes' => $classes_content['global_classes'] ?? null,
			'global_variables' => $classes_content['global_variables'] ?? null,
		];

		$result = apply_filters(
			'elementor/template_library/import/process_content',
			[ 'content' => $db_content ],
			self::IMPORT_MODE,
			$data,
			null
		);

		if ( ! is_array( $result ) || ! isset( $result['content'] ) || ! is_array( $result['content'] ) ) {
			return new \WP_Error(
				'invalid_processed_content',
				__( 'Template processing returned an invalid content structure.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return $result['content'];
	}

	private function flush_post_caches( int $post_id ): void {
		delete_post_meta( $post_id, Interactions_Postmeta::META_KEY );

		do_action( 'elementor/atomic-widgets/styles/clear', [ Atomic_Widget_Styles::STYLES_KEY, $post_id ] );
		do_action(
			'elementor/atomic-widgets/styles/clear',
			[ Atomic_Widget_Styles::STYLES_KEY, $post_id, Atomic_Widget_Styles::CONTEXT_PREVIEW ]
		);
		do_action( 'elementor/atomic-widgets/styles/clear', [ Atomic_Global_Styles::STYLES_KEY, $post_id ] );
		do_action(
			'elementor/atomic-widgets/styles/clear',
			[ Atomic_Global_Styles::STYLES_KEY, $post_id, Atomic_Widget_Styles::CONTEXT_PREVIEW ]
		);

		Plugin::$instance->files_manager->clear_cache();
		( new Post_CSS( $post_id ) )->update();
	}

	private function decode_json_string( string $value, string $field_name ) {
		$decoded = json_decode( $value, true );

		if ( JSON_ERROR_NONE !== json_last_error() ) {
			return new \WP_Error(
				'invalid_json_payload',
				sprintf(
					__( '%s must be a valid JSON string.', 'elementor' ),
					$field_name
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $decoded;
	}

	private function decode_json_object_string( string $value, string $field_name ) {
		$trimmed_value = ltrim( $value );

		if ( '' === $trimmed_value || '{' !== $trimmed_value[0] ) {
			return new \WP_Error(
				'invalid_classes_content',
				__( 'classesContent must be a JSON object when provided.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$decoded = json_decode( $value, true );

		if ( JSON_ERROR_NONE !== json_last_error() ) {
			return new \WP_Error(
				'invalid_json_payload',
				sprintf(
					__( '%s must be a valid JSON string.', 'elementor' ),
					$field_name
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! is_array( $decoded ) ) {
			return new \WP_Error(
				'invalid_classes_content',
				__( 'classesContent must be a JSON object when provided.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $decoded;
	}

	private function assert_rate_limit() {
		$current_user_id = get_current_user_id();
		$transient_key = 'elementor_generate_page_rl_' . $current_user_id;
		$current_count = (int) get_transient( $transient_key );

		if ( $current_count >= self::RATE_LIMIT_MAX_REQUESTS ) {
			return new \WP_Error(
				'rate_limited',
				__( 'Too many generate-page requests. Please retry shortly.', 'elementor' ),
				[ 'status' => \WP_Http::TOO_MANY_REQUESTS ]
			);
		}

		set_transient( $transient_key, $current_count + 1, self::RATE_LIMIT_WINDOW_SECONDS );

		return null;
	}

	private function route_wrapper( callable $cb ) {
		try {
			return $cb();
		} catch ( \Throwable $e ) {
			if ( isset( Plugin::$instance->logger ) ) {
				Plugin::$instance->logger->get_logger()->error( $e->getMessage(), [
					'source' => __CLASS__,
					'trace' => $e->getTraceAsString(),
				] );
			}

			return new \WP_Error(
				'unexpected_error',
				__( 'Something went wrong.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}
	}
}
