<?php
namespace Elementor\Modules\Ai;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Modules\Ai\Connect\Ai;
use Elementor\Plugin;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
class Module extends BaseModule {

	public function get_name() {
		return 'ai';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/connect/apps/register', function ( ConnectModule $connect_module ) {
			$connect_module->register_app( 'ai', Ai::get_class_name() );
		} );

		add_action( 'elementor/ajax/register_actions', function( $ajax ) {
			$ajax->register_ajax_action( 'ai_get_user_information', [ $this, 'ajax_ai_get_user_information' ] );
			$ajax->register_ajax_action( 'ai_get_completion_text', [ $this, 'ajax_ai_get_completion_text' ] );
			$ajax->register_ajax_action( 'ai_get_edit_text', [ $this, 'ajax_ai_get_edit_text' ] );
			$ajax->register_ajax_action( 'ai_get_custom_code', [ $this, 'ajax_ai_get_custom_code' ] );
			$ajax->register_ajax_action( 'ai_get_custom_css', [ $this, 'ajax_ai_get_custom_css' ] );
			$ajax->register_ajax_action( 'ai_set_get_started', [ $this, 'ajax_ai_set_get_started' ] );
			$ajax->register_ajax_action( 'ai_set_status_feedback', [ $this, 'ajax_ai_set_status_feedback' ] );
			$ajax->register_ajax_action( 'ai_get_image_prompt_enhancer', [ $this, 'ajax_ai_get_image_prompt_enhancer' ] );
			$ajax->register_ajax_action( 'ai_get_text_to_image', [ $this, 'ajax_ai_get_text_to_image' ] );
			$ajax->register_ajax_action( 'ai_get_image_to_image', [ $this, 'ajax_ai_get_image_to_image' ] );
			$ajax->register_ajax_action( 'ai_get_image_to_image_mask', [ $this, 'ajax_ai_get_image_to_image_mask' ] );
			$ajax->register_ajax_action( 'ai_get_image_to_image_outpainting', [ $this, 'ajax_ai_get_image_to_image_outpainting' ] );
			$ajax->register_ajax_action( 'ai_get_image_to_image_upscale', [ $this, 'ajax_ai_get_image_to_image_upscale' ] );
			$ajax->register_ajax_action( 'ai_upload_image', [ $this, 'ajax_ai_upload_image' ] );
		} );

		add_action( 'elementor/editor/before_enqueue_scripts', function() {
			wp_enqueue_script(
				'elementor-ai',
				$this->get_js_assets_url( 'ai' ),
				[
					'elementor-common',
					'elementor-editor-modules',
					'elementor-editor-document',
					'elementor-packages-ui',
					'elementor-packages-icons',
				],
				ELEMENTOR_VERSION,
				true
			);

			wp_localize_script(
				'elementor-ai',
				'ElementorAiConfig',
				[
					'is_get_started' => User::get_introduction_meta( 'ai_get_started' ),
				]
			);
		} );

		add_action( 'elementor/editor/after_enqueue_styles', function() {
			wp_enqueue_style(
				'elementor-ai',
				$this->get_css_assets_url( 'modules/ai/editor' ),
				[],
				ELEMENTOR_VERSION
			);
		} );
	}

	public function ajax_ai_get_user_information( $data ) {
		$app = $this->get_ai_app();

		if ( ! $app->is_connected() ) {
			return [
				'is_connected' => false,
				'connect_url' => $app->get_admin_url( 'authorize', [
					'utm_source' => 'ai-popup',
					'utm_campaign' => 'connect-account',
					'utm_medium' => 'wp-dash',
					'source' => 'generic',
				] ),
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

	private function verify_permissions( $editor_post_id ) {
		$document = Plugin::$instance->documents->get( $editor_post_id );

		if ( ! $document ) {
			throw new \Exception( 'Document not found' );
		}

		if ( ! $document->is_built_with_elementor() || ! $document->is_editable_by_current_user() ) {
			throw new \Exception( 'Access denied' );
		}
	}

	public function ajax_ai_get_image_prompt_enhancer( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$result = $app->get_image_prompt_enhanced( $data['prompt'] );
		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return [
			'text' => $result['text'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_completion_text( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$result = $app->get_completion_text( $data['prompt'] );
		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return [
			'text' => $result['text'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	private function get_ai_app() : Ai {
		return Plugin::$instance->common->get_component( 'connect' )->get_app( 'ai' );
	}

	public function ajax_ai_get_edit_text( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['input'] ) ) {
			throw new \Exception( 'Missing input' );
		}

		if ( empty( $data['instruction'] ) ) {
			throw new \Exception( 'Missing instruction' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$result = $app->get_edit_text( $data['input'], $data['instruction'] );
		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return [
			'text' => $result['text'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_custom_code( $data ) {
		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( empty( $data['language'] ) ) {
			throw new \Exception( 'Missing language' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$result = $app->get_custom_code( $data['prompt'], $data['language'] );
		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return [
			'text' => $result['text'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_custom_css( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( empty( $data['html_markup'] ) ) {
			$data['html_markup'] = '';
		}

		if ( empty( $data['element_id'] ) ) {
			throw new \Exception( 'Missing element_id' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$result = $app->get_custom_css( $data['prompt'], $data['html_markup'], $data['element_id'] );
		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

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
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$result = $app->get_text_to_image( $data['prompt'], $data['promptSettings'] );

		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_image_to_image( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( empty( $data['image'] ) || empty( $data['image']['id'] ) ) {
			throw new \Exception( 'Missing Image' );
		}

		if ( empty( $data['promptSettings'] ) ) {
			throw new \Exception( 'Missing prompt settings' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$result = $app->get_image_to_image( [
			'prompt' => $data['prompt'],
			'promptSettings' => $data['promptSettings'],
			'attachment_id' => $data['image']['id'],
		] );

		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_image_to_image_upscale( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['image'] ) || empty( $data['image']['id'] ) ) {
			throw new \Exception( 'Missing Image' );
		}

		if ( empty( $data['promptSettings'] ) ) {
			throw new \Exception( 'Missing prompt settings' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		$result = $app->get_image_to_image_upscale( [
			'promptSettings' => $data['promptSettings'],
			'attachment_id' => $data['image']['id'],
		] );

		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}

	public function ajax_ai_get_image_to_image_mask( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( empty( $data['image'] ) || empty( $data['image']['id'] ) ) {
			throw new \Exception( 'Missing Image' );
		}

		if ( empty( $data['promptSettings'] ) ) {
			throw new \Exception( 'Missing prompt settings' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		if ( empty( $data['mask'] ) ) {
			throw new \Exception( 'Missing Mask' );
		}

		$result = $app->get_image_to_image_mask( [
			'prompt' => $data['prompt'],
			'promptSettings' => $data['promptSettings'],
			'attachment_id' => $data['image']['id'],
			'mask' => $data['mask'],
		] );

		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

		return [
			'images' => $result['images'],
			'response_id' => $result['responseId'],
			'usage' => $result['usage'],
		];
	}
	public function ajax_ai_get_image_to_image_outpainting( $data ) {
		$this->verify_permissions( $data['editor_post_id'] );

		$app = $this->get_ai_app();

		if ( empty( $data['prompt'] ) ) {
			throw new \Exception( 'Missing prompt' );
		}

		if ( ! $app->is_connected() ) {
			throw new \Exception( 'not_connected' );
		}

		if ( empty( $data['mask'] ) ) {
			throw new \Exception( 'Missing Expended Image' );
		}

		$result = $app->get_image_to_image_out_painting( [
			'prompt' => $data['prompt'],
			'mask' => $data['mask'],
		] );

		if ( is_wp_error( $result ) ) {
			throw new \Exception( $result->get_error_message() );
		}

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

		/*if ( ! empty( $image['use_gallery_image'] ) && ! empty( $image['id'] ) ) {
			// todo: uncomment once endpoint is ready send checkpoint
			// $app = $this->get_ai_app();
			// $app->set_used_gallery_image( $image['id'] );
		}*/

		return [
			'image' => array_merge( $image_data, $data ),
		];
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
}
