<?php
namespace Elementor\Modules\Ai\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Library;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Ai extends Library {
	const API_URL = 'https://my.elementor.com/api/v2/ai/';

	public function get_title() {
		return esc_html__( 'AI', 'elementor' );
	}

	protected function get_api_url() {
		return static::API_URL . '/';
	}

	public function get_usage() {
		return $this->request(
			'status/check',
			[
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			true
		);
	}

	public function set_get_started() {
		return $this->request( 'status/get-started',
			[
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			true
		);
	}

	public function set_status_feedback( $response_id ) {
		return $this->request(
			'status/feedback/' . $response_id,
			[
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			true
		);
	}

	public function get_completion_text( $prompt ) {
		return $this->request(
			'text/completion',
			[
				'prompt' => $prompt,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			true
		);
	}

	public function get_edit_text( $input, $instruction ) {
		return $this->request(
			'text/edit',
			[
				'input' => $input,
				'instruction' => $instruction,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			true
		);
	}

	public function get_custom_code( $prompt, $language ) {
		return $this->request(
			'text/custom-code',
			[
				'prompt' => $prompt,
				'language' => $language,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			true
		);
	}

	public function get_custom_css( $prompt, $html_markup, $element_id ) {
		return $this->request(
			'text/custom-css',
			[
				'prompt' => $prompt,
				'html_markup' => $html_markup,
				'element_id' => $element_id,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			true
		);
	}

	public function create_images( $prompt ) {
		return $this->request(
			'image/generations',
			[
				'prompt' => $prompt,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			true
		);
	}

	protected function init() {}
}
