import {
	action,
	DialAction,
	DialRotateEvent,
	DidReceiveSettingsEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";

import { SONAR_COLOR_CHAT, SONAR_COLOR_GAME } from "../const/sonarColors";

import { getChatmixIcon } from "../functions/getChatmixIcon";
import { ELGATO_ALT_WHITE, ELGATO_GREY } from "../const/elgatoColors";
import {
	getAppEndpoint,
	getChatMixState,
	getSonarEndpointCached,
	setChatMixBalance,
} from "steelseries-sonar-sdk";

type ActionSettings = {
	changeSpeed: number;
	pollingSpeed: number;
	useColor?: boolean;
};

const CHATMIX_GRADIENT = `0:${ELGATO_ALT_WHITE},0.5:${ELGATO_GREY},1:${ELGATO_ALT_WHITE}`;
const CHATMIX_GRADIENT_COLORED = `0:${SONAR_COLOR_GAME},1:${SONAR_COLOR_CHAT}`;

@action({ UUID: "com.harleycodes.steelseries-gg-sonar.chatmix-dial" })
export class ChatmixDial extends SingletonAction<ActionSettings> {
	private intervalId: NodeJS.Timeout | null = null;
	private appEndpoint: string | null = null;

	private async getEndpoint(): Promise<string | null> {
		try {
			if (!this.appEndpoint) {
				this.appEndpoint = await getAppEndpoint();
			}
			return await getSonarEndpointCached(this.appEndpoint);
		} catch (err) {
			console.error("Error getting Sonar endpoint:", err);
			return null;
		}
	}
	override async onWillAppear(
		ev: WillAppearEvent<ActionSettings>,
	): Promise<void> {
		if (!ev.action.isDial()) return;

		var settings = ev.payload.settings;
		if (!settings.changeSpeed) settings.changeSpeed = 5;
		if (!settings.pollingSpeed) settings.pollingSpeed = 1500;
		if (!settings.useColor) settings.useColor = true;

		ev.action.setSettings(settings);

		ev.action.setFeedback({
			indicator: {
				value: 50,
				bar_bg_c: settings.useColor
					? CHATMIX_GRADIENT_COLORED
					: CHATMIX_GRADIENT,
			},
			title: "CHATMIX",
			icon: getChatmixIcon(settings.useColor),
		});

		this.intervalId = setInterval(
			this.updateDisplay,
			settings.pollingSpeed,
			ev.action,
		);
	}

	override onWillDisappear(
		ev: WillDisappearEvent<ActionSettings>,
	): Promise<void> | void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	override async onDidReceiveSettings(
		ev: DidReceiveSettingsEvent<ActionSettings>,
	): Promise<void> {
		if (!ev.action.isDial()) return;
		const settings = ev.payload.settings;

		ev.action.setFeedback({
			icon: getChatmixIcon(settings.useColor),
			indicator: {
				bar_bg_c: settings.useColor
					? CHATMIX_GRADIENT_COLORED
					: CHATMIX_GRADIENT,
			},
		});
	}

	override async onDialRotate(
		ev: DialRotateEvent<ActionSettings>,
	): Promise<void> {
		var settings = ev.payload.settings;
		if (!settings) return;

		const endpoint = await this.getEndpoint();
		if (!endpoint) return;

		let chatmixState = await getChatMixState(endpoint);
		if (!chatmixState) return;

		if (!chatmixState.isEnabled) {
			return ev.action.setFeedback({
				value: "Disabled",
			});
		}

		const volumeOffset = ev.payload.ticks * settings.changeSpeed;
		const newVolume = chatmixState.chatBalance + volumeOffset;

		chatmixState = await setChatMixBalance(endpoint, newVolume);

		var displayMixValue = chatmixState.chatBalance;
		var displayMixText = chatmixState.isEnabled
			? `${displayMixValue.toFixed(0)}%`
			: "Disabled";

		ev.action.setFeedback({
			indicator: displayMixValue,
			value: displayMixText,
		});
	}

	private async updateDisplay(action: DialAction<ActionSettings>) {
		if (!action.isDial()) return;

		const endpoint = await this.getEndpoint();
		if (!endpoint) return;

		let chatmixState = await getChatMixState(endpoint);
		if (!chatmixState) return;

		if (!chatmixState.isEnabled) {
			return action.setFeedback({
				indicator: 0,
				value: "",
			});
		}

		var displayMixValue = chatmixState.chatBalance;
		var displayMixText = chatmixState.isEnabled
			? `${displayMixValue.toFixed(0)}%`
			: "Disabled";

		action.setFeedback({
			indicator: displayMixValue,
			value: displayMixText,
		});
	}
}
