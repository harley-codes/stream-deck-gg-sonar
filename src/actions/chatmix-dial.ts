import {
	action,
	DialAction,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveSettingsEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";

import { getChatmixData, offsetChatmixBalance } from "../modules/sonar";
import {
	SONAR_COLOR_CHAT,
	SONAR_COLOR_CHATMIX,
	SONAR_COLOR_GAME,
} from "../const/sonarColors";
import { createIconAdjust } from "../svg/iconAdjust";
import { ELGATO_ALT_WHITE } from "../const/elgatoColors";
import { getChatmixIcon } from "../functions/getChatmixIcon";

type ActionSettings = {
	changeSpeed: number;
	pollingSpeed: number;
	useColor?: boolean;
};

const CHATMIX_GRADIENT = `0:${SONAR_COLOR_GAME},1:${SONAR_COLOR_CHAT}`;

@action({ UUID: "com.harleycodes.steelseries-gg-sonar.chatmix-dial" })
export class ChatmixDial extends SingletonAction<ActionSettings> {
	private intervalId: NodeJS.Timeout | null = null;

	override async onWillAppear(
		ev: WillAppearEvent<ActionSettings>
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
				bar_bg_c: CHATMIX_GRADIENT,
			},
			title: "Chatmix",
			icon: getChatmixIcon(settings.useColor),
		});

		this.intervalId = setInterval(
			this.updateDisplay,
			settings.pollingSpeed,
			ev.action
		);
	}

	override onWillDisappear(
		ev: WillDisappearEvent<ActionSettings>
	): Promise<void> | void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	override async onDidReceiveSettings(
		ev: DidReceiveSettingsEvent<ActionSettings>
	): Promise<void> {
		if (!ev.action.isDial()) return;
		const settings = ev.payload.settings;

		ev.action.setFeedback({
			icon: getChatmixIcon(settings.useColor),
		});
	}

	override async onDialRotate(
		ev: DialRotateEvent<ActionSettings>
	): Promise<void> {
		var settings = ev.payload.settings;

		var amount = ev.payload.ticks * settings.changeSpeed;
		var data = await offsetChatmixBalance(amount);

		if (data === null)
			return ev.action.setFeedback({
				indicator: 100,
				value: "",
			});

		var displayMixValue = ((data.balance + 1) / 2) * 100;
		var displayMixText =
			data.state === "enabled"
				? `${displayMixValue.toFixed(0)}%`
				: "Disabled";

		ev.action.setFeedback({
			indicator: displayMixValue,
			value: displayMixText,
		});
	}

	private async updateDisplay(action: DialAction<ActionSettings>) {
		if (!action.isDial()) return;
		var data = await getChatmixData();
		if (data === null)
			return action.setFeedback({
				indicator: 0,
				value: "",
			});
		var displayMixValue = ((data.balance + 1) / 2) * 100;
		var displayMixText =
			data.state === "enabled"
				? `${displayMixValue.toFixed(0)}%`
				: "Disabled";

		action.setFeedback({
			indicator: displayMixValue,
			value: displayMixText,
		});
	}
}
