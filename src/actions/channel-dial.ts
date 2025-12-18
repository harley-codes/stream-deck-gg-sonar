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

import { getChannelDisplayName } from "../functions/getChannelDisplayName";
import { SonarChannel } from "../types/sonarChannel";
import {
	getChannelData,
	offsetChannelVolume,
	toggleChannelMute,
} from "../modules/sonar";
import { getChannelIcon } from "../functions/getChannelIcon";

type ActionSettings = {
	channel?: SonarChannel;
	changeSpeed: number;
	pollingSpeed: number;
	useSonarColors?: boolean;
};

@action({ UUID: "com.harleycodes.steelseries-gg-sonar.channel-dial" })
export class ChannelDial extends SingletonAction<ActionSettings> {
	private intervalId: NodeJS.Timeout | null = null;

	override async onWillAppear(
		ev: WillAppearEvent<ActionSettings>
	): Promise<void> {
		if (!ev.action.isDial()) return;

		var settings = ev.payload.settings;
		if (!settings.channel) settings.channel = "master";
		if (!settings.changeSpeed) settings.changeSpeed = 5;
		if (!settings.pollingSpeed) settings.pollingSpeed = 750;
		if (!settings.useSonarColors) settings.useSonarColors = true;

		ev.action.setSettings(settings);
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
		if (!settings.channel) return;

		ev.action.setTitle(getChannelDisplayName(settings.channel));

		const data = await getChannelData(settings.channel);
		if (data === null) return;

		const displayVolumeValue = data.volume * 100;
		const displayVolumeText = data.muted
			? "Muted"
			: `${displayVolumeValue.toFixed(0)}%`;

		ev.action.setFeedback({
			icon: getChannelIcon(settings.channel, settings.useSonarColors),
			indicator: displayVolumeValue,
			value: displayVolumeText,
		});
	}

	override async onDialRotate(
		ev: DialRotateEvent<ActionSettings>
	): Promise<void> {
		var settings = ev.payload.settings;
		if (!settings.channel) return;

		var amount = ev.payload.ticks * settings.changeSpeed;
		var data = await offsetChannelVolume(settings.channel, amount);

		if (data === null) return;

		const displayVolumeValue = data.volume * 100;
		const displayVolumeText = data.muted
			? "Muted"
			: `${displayVolumeValue.toFixed(0)}%`;

		ev.action.setFeedback({
			icon: getChannelIcon(settings.channel, settings.useSonarColors),
			indicator: displayVolumeValue,
			value: displayVolumeText,
		});
	}

	override async onDialUp(ev: DialUpEvent<ActionSettings>): Promise<void> {
		var settings = ev.payload.settings;
		if (!settings.channel) return;

		var data = await toggleChannelMute(settings.channel);

		if (data === null) return;

		const displayVolumeValue = data.volume * 100;
		const displayVolumeText = data.muted
			? "Muted"
			: `${displayVolumeValue.toFixed(0)}%`;

		ev.action.setFeedback({
			icon: getChannelIcon(settings.channel, settings.useSonarColors),
			indicator: displayVolumeValue,
			value: displayVolumeText,
		});
	}

	private async updateDisplay(action: DialAction<ActionSettings>) {
		if (!action.isDial()) return;

		var settings = await action.getSettings();
		if (!settings.channel) return;

		var data = await getChannelData(settings.channel);
		if (data === null)
			return action.setFeedback({
				icon: "",
				indicator: 0,
				value: "",
				title: getChannelDisplayName(settings.channel),
			});

		const displayVolumeValue = data.volume * 100;
		const displayVolumeText = data.muted
			? "Muted"
			: `${displayVolumeValue.toFixed(0)}%`;

		action.setFeedback({
			icon: getChannelIcon(settings.channel, settings.useSonarColors),
			indicator: displayVolumeValue,
			value: displayVolumeText,
			title: getChannelDisplayName(settings.channel),
		});
	}
}
