<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Llms_Manual_Content;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Llms_Revert_Ajax {

	const ACTION = 'agents_ready_revert_llms_content';

	private Agent_Ready_Settings $settings;
	private Llms_Manual_Content $manual_content;

	public function __construct( Agent_Ready_Settings $settings, Llms_Manual_Content $manual_content ) {
		$this->settings       = $settings;
		$this->manual_content = $manual_content;
	}

	/**
	 * @throws \Exception When the user can't manage options.
	 */
	public function handle(): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( esc_html__( 'Permission denied.', 'elementor' ), Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$this->manual_content->delete();
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'is_manually_edited', false );

		return [
			'isManuallyEdited' => false,
		];
	}
}
