<?php

namespace Elementor\App\Modules\E_Onboarding;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Loading_Handler {

	const COOKIE_NAME = 'e_onboarding';

	public static function is_from_onboarding(): bool {
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		return ! empty( $_COOKIE[ self::COOKIE_NAME ] );
	}

	public static function maybe_render_styles(): void {
		if ( ! self::is_from_onboarding() ) {
			return;
		}
		?>
		<style>
		#elementor-loading.e-from-onboarding {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 32px;
			font-family: var(--e-a-font-family);
		}
		#elementor-loading.e-from-onboarding .elementor-loader-wrapper { display: none; }
		.e-ob-track {
			width: 192px;
			height: 4px;
			border-radius: 22px;
			background: var(--e-a-border-color-bold);
			position: relative;
			overflow: hidden;
		}
		.e-ob-fill {
			position: absolute;
			top: 0;
			left: -40%;
			height: 100%;
			width: 40%;
			border-radius: 22px;
			background: var(--e-a-color-txt-active);
			animation: e-ob-slide 1.5s linear infinite;
		}
		@keyframes e-ob-slide { 0% { left: -40%; } 100% { left: 140%; } }
		.e-ob-text {
			text-align: center;
		}
		.e-ob-heading {
			margin: 0 0 8px;
			font-size: 24px;
			font-weight: 500;
			font-family: Poppins, var(--e-a-font-family);
			color: var(--e-a-color-txt-active);
		}
		.e-ob-subtext {
			margin: 0;
			font-size: 16px;
			font-family: var(--e-a-font-family);
			color: var(--e-a-color-txt-hover);
		}
		</style>
		<?php
	}

	public static function maybe_render_content(): void {
		if ( ! self::is_from_onboarding() ) {
			return;
		}
		?>
		<script>document.currentScript.parentElement.classList.add('e-from-onboarding'); document.cookie = 'e_onboarding=; path=/; max-age=0; SameSite=Lax';</script>
		<div class="e-ob-track"><div class="e-ob-fill"></div></div>
		<div class="e-ob-text">
			<p class="e-ob-heading"><?php echo esc_html__( 'Getting things ready', 'elementor' ); ?></p>
			<p class="e-ob-subtext"><?php echo esc_html__( 'Tailoring the editor to your goals and workflow…', 'elementor' ); ?></p>
		</div>
		<?php
	}
}
