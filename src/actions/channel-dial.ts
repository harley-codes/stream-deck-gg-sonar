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

import { getDefaultColor } from "../functions/getDefaultColor";
import { getChannelDisplayName } from "../functions/getChannelDisplayName";
import { getChannelImagePath } from "../functions/getChannelImagePath";
import { sonarGetChannelVolumeAsync } from "../functions/sonarGetChannelVolumeAsync";
import { sonarOffsetChannelVolumeAsync } from "../functions/sonarOffestChannelVolumeAsync";
import { clampVolume } from "../functions/clampVolume";
import { sonarToggleChannelMuteAsync } from "../functions/sonarToggleChannelMuteAsync";
import { sonarGetChannelMuteAsync } from "../functions/sonarGetChannelMuteAsync";

type ActionSettings = {
	channel: "master" | "game" | "chat" | "media" | "aux" | "mic";
	color?: string;
	changeSpeed: number;
	pollingSpeed: number;
};

@action({ UUID: "com.harleycodes.steelseries-gg-sonar.channel-dial" })
export class ChannelDial extends SingletonAction<ActionSettings> {
	private intervalId: NodeJS.Timeout | null = null;

	private async updateDisplay(action: DialAction<ActionSettings>) {
		if (!action.isDial()) return;

		var latestSettings = await action.getSettings();

		var channelVolume = await sonarGetChannelVolumeAsync(
			latestSettings.channel
		);
		var channelVolumeDisplay = clampVolume(channelVolume, true) * 100;
		var channelIsMuted = await sonarGetChannelMuteAsync(
			latestSettings.channel
		);

		action.setFeedback({
			icon: getChannelImagePath(latestSettings.channel),
			indicator: channelVolume * 100,
			value: !channelIsMuted
				? `${channelVolumeDisplay.toFixed(0)}%`
				: "Muted",
			title: getChannelDisplayName(latestSettings.channel),
		});
	}

	override async onWillAppear(
		ev: WillAppearEvent<ActionSettings>
	): Promise<void> {
		if (!ev.action.isDial()) return;

		var settings = ev.payload.settings;
		if (!settings.channel) settings.channel = "master";
		if (!settings.color) settings.color = getDefaultColor(settings.channel);
		if (!settings.changeSpeed) settings.changeSpeed = 5;
		if (!settings.pollingSpeed) settings.pollingSpeed = 750;

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
		var settings = ev.payload.settings;
		settings.color = getDefaultColor(settings.channel);
		ev.action.setSettings(settings);
		ev.action.setTitle(getChannelDisplayName(settings.channel));
		var channelVolume = await sonarGetChannelVolumeAsync(settings.channel);
		var displayVolume = clampVolume(channelVolume, true) * 100;
		ev.action.setFeedback({
			icon: getChannelImagePath(settings.channel),
			indicator: displayVolume,
			value: `${displayVolume.toFixed(0)}%`,
		});
	}

	override async onDialRotate(
		ev: DialRotateEvent<ActionSettings>
	): Promise<void> {
		var settings = ev.payload.settings;
		var amount = (ev.payload.ticks / 100) * settings.changeSpeed;
		await sonarOffsetChannelVolumeAsync(settings.channel, amount);
		await this.updateDisplay(ev.action);
	}

	override async onDialUp(ev: DialUpEvent<ActionSettings>): Promise<void> {
		var settings = ev.payload.settings;
		var result = await sonarToggleChannelMuteAsync(settings.channel);
		if (result === undefined) return;
		await this.updateDisplay(ev.action);
	}
}
