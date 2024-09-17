<?php
namespace Elementor\Modules\Ai;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Plugin;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\Ai\Connect\Ai;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const HISTORY_TYPE_ALL = 'all';
	const HISTORY_TYPE_TEXT = 'text';
	const HISTORY_TYPE_CODE = 'code';
	const HISTORY_TYPE_IMAGE = 'images';
	const HISTORY_TYPE_BLOCK = 'blocks';
	const VALID_HISTORY_TYPES = [
		self::HISTORY_TYPE_ALL,
		self::HISTORY_TYPE_TEXT,
		self::HISTORY_TYPE_CODE,
		self::HISTORY_TYPE_IMAGE,
		self::HISTORY_TYPE_BLOCK,
	];

	public function get_name() {
		return 'ai';
	}

	public function __construct() {
		parent::__construct();

		if ( is_admin() ) {
			( new Preferences() )->register();
		}

		if ( ! Plugin::$instance->experiments->is_feature_active( 'container' ) ) {
			return;
		}

		if ( ! Preferences::is_ai_enabled( get_current_user_id() ) ) {
			return;
		}

		add_action( 'elementor/connect/apps/register', function ( ConnectModule $connect_module ) {
			$connect_module->register_app( 'ai', Ai::get_class_name() );
		} );

		add_action( 'elementor/ajax/register_actions', function( $ajax ) {
			$handlers = [
				'ai_get_user_information' => [ $this, 'ajax_ai_get_user_information' ],
				'ai_get_remote_config' => [ $this, 'ajax_ai_get_remote_config' ],
				'ai_get_remote_frontend_config' => [ $this, 'ajax_ai_get_remote_frontend_config' ],
				'ai_get_completion_text' => [ $this, 'ajax_ai_get_completion_text' ],
				'ai_get_excerpt' => [ $this, 'ajax_ai_get_excerpt' ],
				'ai_get_featured_image' => [ $this, 'ajax_ai_get_featured_image' ],
				'ai_get_edit_text' => [ $this, 'ajax_ai_get_edit_text' ],
				'ai_get_custom_code' => [ $this, 'ajax_ai_get_custom_code' ],
				'ai_get_custom_css' => [ $this, 'ajax_ai_get_custom_css' ],
				'ai_set_get_started' => [ $this, 'ajax_ai_set_get_started' ],
				'ai_set_status_feedback' => [ $this, 'ajax_ai_set_status_feedback' ],
				'ai_get_image_prompt_enhancer' => [ $this, 'ajax_ai_get_image_prompt_enhancer' ],
				'ai_get_text_to_image' => [ $this, 'ajax_ai_get_text_to_image' ],
				'ai_get_image_to_image' => [ $this, 'ajax_ai_get_image_to_image' ],
				'ai_get_image_to_image_mask' => [ $this, 'ajax_ai_get_image_to_image_mask' ],
				'ai_get_image_to_image_mask_cleanup' => [ $this, 'ajax_ai_get_image_to_image_mask_cleanup' ],
				'ai_get_image_to_image_outpainting' => [ $this, 'ajax_ai_get_image_to_image_outpainting' ],
				'ai_get_image_to_image_upscale' => [ $this, 'ajax_ai_get_image_to_image_upscale' ],
				'ai_get_image_to_image_remove_background' => [ $this, 'ajax_ai_get_image_to_image_remove_background' ],
				'ai_get_image_to_image_replace_background' => [ $this, 'ajax_ai_get_image_to_image_replace_background' ],
				'ai_upload_image' => [ $this, 'ajax_ai_upload_image' ],
				'ai_generate_layout' => [ $this, 'ajax_ai_generate_layout' ],
				'ai_get_layout_prompt_enhancer' => [ $this, 'ajax_ai_get_layout_prompt_enhancer' ],
				'ai_get_history' => [ $this, 'ajax_ai_get_history' ],
				'ai_delete_history_item' => [ $this, 'ajax_ai_delete_history_item' ],
				'ai_toggle_favorite_history_item' => [ $this, 'ajax_ai_toggle_favorite_history_item' ],
			];

			foreach ( $handlers as $tag => $callback ) {
				$ajax->register_ajax_action( $tag, $callback );
			}
		} );

		add_action( 'elementor/editor/before_enqueue_scripts', function() {
			$this->enqueue_main_script();
			$this->enqueue_layout_script();
		} );

		add_action( 'elementor/editor/after_enqueue_styles', function() {
			wp_enqueue_style(
				'elementor-ai-editor',
				$this->get_css_assets_url( 'modules/ai/editor' ),
				[],
				ELEMENTOR_VERSION
			);
		} );

		add_action( 'elementor/preview/enqueue_styles', function() {
			wp_enqueue_style(
				'elementor-ai-layout-preview',
				$this->get_css_assets_url( 'modules/ai/layout-preview' ),
				[],
				ELEMENTOR_VERSION
			);
		} );

		if ( is_admin() ) {
			add_action( 'wp_enqueue_media', [ $this, 'enqueue_ai_media_library' ] );
		}

		add_action( 'enqueue_block_editor_assets', function() {
			wp_enqueue_script( 'elementor-ai-gutenberg',
				$this->get_js_assets_url( 'ai-gutenberg' ),
				[
					'jquery',
					'elementor-v2-ui',
					'elementor-v2-icons',
					'wp-blocks',
					'wp-element',
					'wp-editor',
					'wp-data',
					'wp-components',
					'wp-compose',
					'wp-i18n',
					'wp-hooks',
					'elementor-ai-media-library',
				],
			ELEMENTOR_VERSION, true );

			wp_localize_script(
				'elementor-ai-gutenberg',
				'ElementorAiConfig',
				[
					'is_get_started' => User::get_introduction_meta( 'ai_get_started' ),
					'connect_url' => $this->get_ai_connect_url(),
				]
			);

			wp_set_script_translations( 'elementor-ai-gutenberg', 'elementor' );
		});

		add_filter( 'elementor/document/save/data', function ( $data ) {
			return $this->remove_temporary_containers( $data );
		} );
	}

	public function enqueue_ai_media_library() {
		wp_enqueue_script( 'elementor-ai-media-library',
			$this->get_js_assets_url( 'ai-media-library' ),
			[
				'jquery',
				'elementor-v2-ui',
				'elementor-v2-icons',
				'media-grid',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			'elementor-ai-media-library',
			'ElementorAiConfig',
			[
				'is_get_started' => User::get_introduction_meta( 'ai_get_started' ),
				'connect_url' => $this->get_ai_connect_url(),
			]
		);

		wp_set_script_translations( 'elementor-ai-media-library', 'elementor' );
	}

	private function enqueue_main_script() {
		wp_enqueue_script(
			'elementor-ai',
			$this->get_js_assets_url( 'ai' ),
			[
				'react',
				'react-dom',
				'backbone-marionette',
				'elementor-web-cli',
				'wp-date',
				'elementor-common',
				'elementor-editor-modules',
				'elementor-editor-document',
				'elementor-v2-ui',
				'elementor-v2-icons',
			],
			ELEMENTOR_VERSION,
			true
		);

		$config = [
			'is_get_started' => User::get_introduction_meta( 'ai_get_started' ),
			'connect_url' => $this->get_ai_connect_url(),
		];

		if ( $this->get_ai_app()->is_connected() ) {
			// Use a cached version, don't call the API on every editor load.
			$config['usage'] = $this->get_ai_app()->get_cached_usage();
		}

		wp_localize_script(
			'elementor-ai',
			'ElementorAiConfig',
			$config
		);

		wp_set_script_translations( 'elementor-ai', 'elementor' );
	}

	private function enqueue_layout_script() {
		wp_enqueue_script(
			'elementor-ai-layout',
			$this->get_js_assets_url( 'ai-layout' ),
			[
				'react',
				'react-dom',
				'backbone-marionette',
				'elementor-common',
				'elementor-web-cli',
				'elementor-editor-modules',
				'elementor-ai',
				'elementor-v2-ui',
				'elementor-v2-icons',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_set_script_translations( 'elementor-ai-layout', 'elementor' );
	}

	private function remove_temporary_containers( $data ) {
		if ( empty( $data['elements'] ) ) {
			return $data;
		}

		// If for some reason the document has been saved during an AI Layout session,
		// ensure that the temporary containers are removed from the data.
		$data['elements'] = array_filter( $data['elements'], function( $element ) {
			$is_preview_container = strpos( $element['id'], 'e-ai-preview-container' ) === 0;
			$is_screenshot_container = strpos( $element['id'], 'e-ai-screenshot-container' ) === 0;

			return ! $is_preview_container && ! $is_screenshot_container;
		} );

		return $data;
	}

	private function get_ai_connect_url() {
		$app = $this->get_ai_app();

		return $app->get_admin_url( 'authorize', [
			'utm_source' => 'ai-popup',
			'utm_campaign' => 'connect-account',
			'utm_medium' => 'wp-dash',
			'source' => 'generic',
		] );
	}

	public function ajax_ai_get_user_information( $data ) {
		$app = $this->get_ai_app();

		if ( ! $app->is_connected() ) {
			return [
				'is_connected' => false,
				'connect_url' => $this->get_ai_connect_url(),
			];
		}

		$user_usage = wp_parse_args( $app->get_usage(), [
			'hasAiSubscription' => false,
			'usedQuota' => 0,
			'quota' => 100,
		] );

		return [
			'is_connected' => true,
			'is_get_started' => User::get_introduction_meta( 'ai_get_started' ),
			'usage' => $user_usage,
		];
	}

	public function ajax_ai_get_remote_config() {
		$app = $this->get_ai_app();

		if ( ! $app->is_connected() ) {
			return [];
		}

		return $app->get_remote_config();
	}

	public function ajax_ai_get_remote_frontend_config( $data ) {
		$callback = function () use ( $data ) {
			return $this->get_ai_app()->get_remote_frontend_config( $data );
		};

		return Utils::get_cached_callback( $callback, 'ai_remote_frontend_config-' . get_current_user_id(), HOUR_IN_SECONDS );
	}

	public function verify_upload_permissions( $data ) {
		$referer = wp_get_referer();

		if ( str_contains( $referer, 'wp-admin/upload.php' ) && current_user_can( 'upload_files' ) ) {
			return;
		}
		$this->verify_permissions( $data['editor_post_id'] );
	}
	private function verify_permissions( $editor_post_id ) {
		$document = Plugin::$instance->documents->get( $editor_post_id );

		if ( ! $document ) {
			throw new \Exception( 'Document not found' );
		}

		if ( ! $document->is_editable_by_current_user() ) {
			throw new \Exception( 'Access denied' );
		}
	}

	public function ajax_ai_get_image_prompt_enhancer( $data ) {
		$this->verify_upload_permissions( $data );

		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}
		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_image_prompt_enhanced( $data['prompt'], [], $request_ids );
		$this->throw_on_error( $result );

		return [
			'text' => $result['text'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_completion_text( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['payload']['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );

		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_completion_text( $data['payload']['prompt'], $context, $request_ids );
		$this->throw_on_error( $result );

		return [
			'text' => $result['text'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}


	public function ajax_ai_get_excerpt( $data ): array {
		$app = $this->get_ai_app();

		if ( empty( $data['payload']['content'] ) ) {
			throw new \Exception( 'Missing content' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'Not connected' );
		}

		$context = $this->get_request_context( $data );

		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_excerpt( $data['payload']['content'], $context, $request_ids );
		$this->throw_on_error( $result );

		return [
			'text' => $result['text'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_featured_image( $data ): array {
		$this->verify_upload_permissions( $data );

		if ( empty( $data['payload']['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		$app = $this->get_ai_app();

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );
		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_featured_image( $data, $context, $request_ids );

		$this->throw_on_error( $result );

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	private function get_ai_app() : Ai {
		return Plugin::$instance->common->get_component( 'connect' )->get_app( 'ai' );
	}

	private function get_request_context( $data ) {
		if ( empty( $data['context'] ) ) {
			return [];
		}

		return $data['context'];
	}

	private function get_request_ids( $data ) {
		if ( empty( $data['requestIds'] ) ) {
			return new \stdClass();
		}

		return $data['requestIds'];
	}

	public function ajax_ai_get_edit_text( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['payload']['input'] ) ) {
			throw new \Exception( 'Missing input' );
		}

		if ( empty( $data['payload']['instruction'] ) ) {
			throw new \Exception( 'Missing instruction' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );

		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_edit_text( $data, $context, $request_ids );
		$this->throw_on_error( $result );

		return [
			'text' => $result['text'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_custom_code( $data ) {
		$app = $this->get_ai_app();

		if ( empty( $data['payload']['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( empty( $data['payload']['language'] ) ) {
			throw new \Exception( 'Missing language' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );

		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_custom_code( $data, $context, $request_ids );
		$this->throw_on_error( $result );

		return [
			'text' => $result['text'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_custom_css( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['payload']['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( empty( $data['payload']['html_markup'] ) ) {
			$data['html_markup'] = '';
		}

		if ( empty( $data['payload']['element_id'] ) ) {
			throw new \Exception( 'Missing element_id' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );
		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_custom_css( $data, $context, $request_ids );
		$this->throw_on_error( $result );

		return [
			'text' => $result['text'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_set_get_started( $data ) {
		$app = $this->get_ai_app();

		User::set_introduction_viewed( [
			'introductionKey' => 'ai_get_started',
		] );

		return $app->set_get_started();
	}

	public function ajax_ai_set_status_feedback( $data ) {
		if ( empty( $data['response_id'] ) ) {
			throw new \Exception( 'Missing response_id' );
		}

		$app = $this->get_ai_app();

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$app->set_status_feedback( $data['response_id'] );

		return [];
	}

	public function ajax_ai_get_text_to_image( $data ) {
		$this->verify_upload_permissions( $data );

		if ( empty( $data['payload']['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		$app = $this->get_ai_app();

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );
		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_text_to_image( $data, $context, $request_ids );

		$this->throw_on_error( $result );

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_image_to_image( $data ) {
		$this->verify_upload_permissions( $data );

		$app = $this->get_ai_app();

		if ( empty( $data['payload']['image'] ) || empty( $data['payload']['image']['id'] ) ) {
			throw new \Exception( 'Missing Image' );
		}

		if ( empty( $data['payload']['settings'] ) ) {
			throw new \Exception( 'Missing prompt settings' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );
		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_image_to_image( [
			'prompt' => $data['payload']['prompt'],
			'promptSettings' => $data['payload']['settings'],
			'attachment_id' => $data['payload']['image']['id'],
		], $context, $request_ids );

		$this->throw_on_error( $result );

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_image_to_image_upscale( $data ) {
		$this->verify_upload_permissions( $data );

		$app = $this->get_ai_app();

		if ( empty( $data['payload']['image'] ) || empty( $data['payload']['image']['id'] ) ) {
			throw new \Exception( 'Missing Image' );
		}

		if ( empty( $data['payload']['promptSettings'] ) ) {
			throw new \Exception( 'Missing prompt settings' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );
		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_image_to_image_upscale( [
			'promptSettings' => $data['payload']['promptSettings'],
			'attachment_id' => $data['payload']['image']['id'],
		], $context, $request_ids );

		$this->throw_on_error( $result );

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_image_to_image_replace_background( $data ) {
		$this->verify_upload_permissions( $data );

		$app = $this->get_ai_app();

		if ( empty( $data['payload']['image'] ) || empty( $data['payload']['image']['id'] ) ) {
			throw new \Exception( 'Missing Image' );
		}

		if ( empty( $data['payload']['prompt'] ) ) {
			throw new \Exception( 'Prompt Missing' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );
		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_image_to_image_replace_background( [
			'attachment_id' => $data['payload']['image']['id'],
			'prompt' => $data['payload']['prompt'],
		], $context, $request_ids );

		$this->throw_on_error( $result );

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_image_to_image_remove_background( $data ) {
		$this->verify_upload_permissions( $data );

		$app = $this->get_ai_app();

		if ( empty( $data['payload']['image'] ) || empty( $data['payload']['image']['id'] ) ) {
			throw new \Exception( 'Missing Image' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );
		$request_ids = $this->get_request_ids( $data['payload'] );
		$result = $app->get_image_to_image_remove_background( [
			'attachment_id' => $data['payload']['image']['id'],
		], $context, $request_ids );

		$this->throw_on_error( $result );

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_image_to_image_mask( $data ) {
		$this->verify_upload_permissions( $data );

		$app = $this->get_ai_app();

		if ( empty( $data['payload']['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( empty( $data['payload']['image'] ) || empty( $data['payload']['image']['id'] ) ) {
			throw new \Exception( 'Missing Image' );
		}

		if ( empty( $data['payload']['settings'] ) ) {
			throw new \Exception( 'Missing prompt settings' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		if ( empty( $data['payload']['mask'] ) ) {
			throw new \Exception( 'Missing Mask' );
		}

		$context = $this->get_request_context( $data );
		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_image_to_image_mask( [
			'prompt' => $data['payload']['prompt'],
			'attachment_id' => $data['payload']['image']['id'],
			'mask' => $data['payload']['mask'],
		], $context, $request_ids );

		$this->throw_on_error( $result );

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}
	public function ajax_ai_get_image_to_image_mask_cleanup( $data ) {
		$this->verify_upload_permissions( $data );

		$app = $this->get_ai_app();

		if ( empty( $data['payload']['image'] ) || empty( $data['payload']['image']['id'] ) ) {
			throw new \Exception( 'Missing Image' );
		}

		if ( empty( $data['payload']['settings'] ) ) {
			throw new \Exception( 'Missing prompt settings' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		if ( empty( $data['payload']['mask'] ) ) {
			throw new \Exception( 'Missing Mask' );
		}

		$context = $this->get_request_context( $data );
		$request_ids = $this->get_request_ids( $data['payload'] );

		$result = $app->get_image_to_image_mask_cleanup( [
			'attachment_id' => $data['payload']['image']['id'],
			'mask' => $data['payload']['mask'],
		], $context, $request_ids );

		$this->throw_on_error( $result );

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_image_to_image_outpainting( $data ) {
		$this->verify_upload_permissions( $data );

		$app = $this->get_ai_app();

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		if ( empty( $data['payload']['mask'] ) ) {
			throw new \Exception( 'Missing Expended Image' );
		}

		$context = $this->get_request_context( $data );
		$request_ids = $this->get_request_ids( $data['payload'] );
		$result = $app->get_image_to_image_out_painting( [
			'size' => $data['payload']['size'],
			'position' => $data['payload']['position'],
			'mask' => $data['payload']['mask'],
			'image_base64' => $data['payload']['image_base64'],
		], $context, $request_ids );

		$this->throw_on_error( $result );

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_upload_image( $data ) {
		if ( empty( $data['image'] ) ) {
			throw new \Exception( 'Missing image data' );
		}

		$image = $data['image'];

		if ( empty( $image['image_url'] ) ) {
			throw new \Exception( 'Missing image_url' );
		}

		$image_data = $this->upload_image( $image['image_url'], $data['prompt'], $data['editor_post_id'] );

		if ( is_wp_error( $image_data ) ) {
			throw new \Exception( $image_data->get_error_message() );
		}

		if ( ! empty( $image['use_gallery_image'] ) && ! empty( $image['id'] ) ) {
			 $app = $this->get_ai_app();
			 $app->set_used_gallery_image( $image['id'] );
		}

		return [
			'image' => array_merge( $image_data, $data ),
		];
	}

	public function ajax_ai_generate_layout( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) && empty( $data['attachments'] ) ) {
			throw new \Exception( 'Missing prompt / attachments' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$result = $app->generate_layout(
			$data,
			$this->prepare_generate_layout_context( $data )
		);

		if ( is_wp_error( $result ) ) {
			$message = $result->get_error_message();

			if ( is_array( $message ) ) {
				$message = implode( ', ', $message );
				throw new \Exception( $message );
			}

			$this->throw_on_error( $result );
		}

		$elements = $result['text']['elements'] ?? [];
		$base_template_id = $result['baseTemplateId'] ?? null;
		$template_type = $result['templateType'] ?? null;

		if ( empty( $elements ) || ! is_array( $elements ) ) {
			throw new \Exception( 'unknown_error' );
		}

		if ( 1 === count( $elements ) ) {
			$template = $elements[0];
		} else {
			$template = [
				'elType' => 'container',
				'elements' => $elements,
				'settings' => [
					'content_width' => 'full',
					'flex_gap' => [
						'column' => '0',
						'row' => '0',
						'unit' => 'px',
					],
					'padding' => [
						'unit' => 'px',
						'top' => '0',
						'right' => '0',
						'bottom' => '0',
						'left' => '0',
						'isLinked' => true,
					],
				],
			];
		}

		return [
			'all' => [],
			'text' => $template,
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
			'base_template_id' => $base_template_id,
			'template_type' => $template_type,
		];
	}

	public function ajax_ai_get_layout_prompt_enhancer( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$result = $app->get_layout_prompt_enhanced(
			$data['prompt'],
			$data['enhance_type'],
			$this->prepare_generate_layout_context( $data )
		);

		$this->throw_on_error( $result );

		return [
			'text' => $result['text'] ?? $data['prompt'],
			'response_id' => $result['responseId'] ?? '',
			'usage' => $result['usage'] ?? '',
		];
	}

	private function prepare_generate_layout_context( $data ) {
		$request_context = $this->get_request_context( $data );
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return $request_context;
		}

		$kits_data = Collection::make( $kit->get_data()['settings'] ?? [] );

		$colors = $kits_data
			->filter( function ( $_, $key ) {
				return in_array( $key, [ 'system_colors', 'custom_colors' ], true );
			} )
			->flatten()
			->filter( function ( $val ) {
				return ! empty( $val['_id'] );
			} )
			->map( function ( $val ) {
				return [
					'id' => $val['_id'],
					'label' => $val['title'] ?? null,
					'value' => $val['color'] ?? null,
				];
			} );

		$typography = $kits_data
			->filter( function ( $_, $key ) {
				return in_array( $key, [ 'system_typography', 'custom_typography' ], true );
			} )
			->flatten()
			->filter( function ( $val ) {
				return ! empty( $val['_id'] );
			} )
			->map( function ( $val ) {
				$font_size = null;

				if ( isset(
					$val['typography_font_size']['unit'],
					$val['typography_font_size']['size']
				) ) {
					$prop = $val['typography_font_size'];

					$font_size = 'custom' === $prop['unit']
						? $prop['size']
						: $prop['size'] . $prop['unit'];
				}

				return [
					'id' => $val['_id'],
					'label' => $val['title'] ?? null,
					'value' => [
						'family' => $val['typography_font_family'] ?? null,
						'weight' => $val['typography_font_weight'] ?? null,
						'style' => $val['typography_font_style'] ?? null,
						'size' => $font_size,
					],
				];
			} );

		$request_context['globals'] = [
			'colors' => $colors->all(),
			'typography' => $typography->all(),
		];

		return $request_context;
	}

	private function upload_image( $image_url, $image_title, $parent_post_id = 0 ) {
		if ( ! current_user_can( 'upload_files' ) ) {
			throw new \Exception( 'Not Allowed to Upload images' );
		}

		$attachment_id = media_sideload_image( $image_url, $parent_post_id, $image_title, 'id' );

		if ( ! empty( $attachment_id['error'] ) ) {
			return new \WP_Error( 'upload_error', $attachment_id['error'] );
		}

		return [
			'id' => $attachment_id,
			'url' => wp_get_attachment_image_url( $attachment_id, 'full' ),
			'alt' => $image_title,
			'source' => 'library',
		];
	}

	public function ajax_ai_get_history( $data ): array {
		$type = $data['type'] ?? self::HISTORY_TYPE_ALL;

		if ( ! in_array( $type, self::VALID_HISTORY_TYPES, true ) ) {
			throw new \Exception( 'Invalid history type' );
		}

		$page = sanitize_text_field( $data['page'] ?? 1 );
		$limit = sanitize_text_field( $data['limit'] ?? 10 );

		$app = $this->get_ai_app();

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );

		$result = $app->get_history_by_type( $type, $page, $limit, $context );

		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return $result;
	}

	public function ajax_ai_delete_history_item( $data ): array {
		if ( empty( $data['id'] ) || ! wp_is_uuid( $data['id'] ) ) {
			throw new \Exception( 'Missing id parameter' );
		}

		$app = $this->get_ai_app();

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );

		$result = $app->delete_history_item( $data['id'], $context );

		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return [];
	}

	public function ajax_ai_toggle_favorite_history_item( $data ): array {
		if ( empty( $data['id'] ) || ! wp_is_uuid( $data['id'] ) ) {
			throw new \Exception( 'Missing id parameter' );
		}

		$app = $this->get_ai_app();

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$context = $this->get_request_context( $data );

		$result = $app->toggle_favorite_history_item( $data['id'], $context );

		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return [];
	}

	/**
	 * @param mixed $result
	 */
	private function throw_on_error( $result ): void {
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( [
				'message' => $result->get_error_message(),
				'extra_data' => $result->get_error_data(),
			] );
		}
	}
}
