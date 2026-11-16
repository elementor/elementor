<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Llms_Manual_Content;
use Elementor\Modules\Agents\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Llms_Content_Ajax {

	const ACTION = 'agents_ready_save_llms_content';

	private Agent_Ready_Settings $settings;
	private Llms_Manual_Content $manual_content;

	public function __construct( Agent_Ready_Settings $settings, Llms_Manual_Content $manual_content ) {
		$this->settings       = $settings;
		$this->manual_content = $manual_content;
	}

	/**
	 * @param array $data Ajax request data: { content: string }.
	 * @throws \Exception When the user can't manage options, a physical file exists, or the content is invalid.
	 */
	public function handle( array $data ): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( esc_html__( 'Permission denied.', 'elementor' ), Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( Module::has_physical_llms_file() ) {
			throw new \Exception( esc_html__( 'LLMs.txt file already exists and can’t be managed here.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$content = is_string( $data['content'] ?? null ) ? $data['content'] : '';

		$this->manual_content->save( $content );
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'is_manually_edited', true );

		return [
			'isManuallyEdited' => true,
		];
	}
}
