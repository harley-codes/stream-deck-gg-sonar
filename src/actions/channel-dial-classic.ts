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
import { getChannelIcon } from "../functions/getChannelIcon";

import {
	AudioChannel,
	getAppEndpoint,
	getAudioDataClassic,
	getSonarEndpointCached,
	setChannelMuteClassic,
	setChannelVolumeClassic,
} from "steelseries-sonar-sdk";

type ActionSettings = {
	channel?: AudioChannel;
	changeSpeed: number;
	pollingSpeed: number;
	useSonarColors?: boolean;
};

@action({ UUID: "com.harleycodes.steelseries-gg-sonar.channel-dial-classic" })
export class ChannelDialClassic extends SingletonAction<ActionSettings> {
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
		if (!settings.channel) settings.channel = AudioChannel.Master;
		if (!settings.changeSpeed) settings.changeSpeed = 5;
		if (!settings.pollingSpeed) settings.pollingSpeed = 750;
		if (!settings.useSonarColors) settings.useSonarColors = true;

		ev.action.setSettings(settings);
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
		if (!settings.channel) return;

		ev.action.setTitle(getChannelDisplayName(settings.channel));

		const endpoint = await this.getEndpoint();
		if (!endpoint) return;

		const audioData = await getAudioDataClassic(endpoint);
		let channelAudio = audioData[settings.channel];

		if (!channelAudio) return;

		const displayVolumeValue = channelAudio.volume;
		const displayVolumeText = channelAudio.isMuted
			? "Muted"
			: `${displayVolumeValue.toFixed(0)}%`;

		ev.action.setFeedback({
			icon: getChannelIcon(settings.channel, settings.useSonarColors),
			indicator: displayVolumeValue,
			value: displayVolumeText,
		});
	}

	override async onDialRotate(
		ev: DialRotateEvent<ActionSettings>,
	): Promise<void> {
		const settings = ev.payload.settings;
		if (!settings.channel) return;

		const endpoint = await this.getEndpoint();
		if (!endpoint) return;

		const audioData = await getAudioDataClassic(endpoint);
		let channelAudio = audioData[settings.channel];

		if (!channelAudio) return;

		var volumeOffset = ev.payload.ticks * settings.changeSpeed;
		var newVolume = channelAudio.volume + volumeOffset;

		channelAudio = await setChannelVolumeClassic(
			endpoint,
			newVolume,
			settings.channel,
		);

		if (!channelAudio) return;

		const displayVolumeValue = channelAudio.volume;
		const displayVolumeText = channelAudio.isMuted
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

		const endpoint = await this.getEndpoint();
		if (!endpoint) return;

		const audioData = await getAudioDataClassic(endpoint);
		let channelAudio = audioData[settings.channel];
		if (!channelAudio) return;

		const isMuted = !channelAudio.isMuted;
		channelAudio = await setChannelMuteClassic(
			endpoint,
			isMuted,
			settings.channel,
		);
		if (!channelAudio) return;

		const displayVolumeValue = channelAudio.volume;
		const displayVolumeText = channelAudio.isMuted
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

		const endpoint = await this.getEndpoint();
		if (!endpoint) return;

		const audioData = await getAudioDataClassic(endpoint);
		const channelAudio = audioData[settings.channel];

		if (!channelAudio) {
			return action.setFeedback({
				icon: "",
				indicator: 0,
				value: "",
				title: getChannelDisplayName(settings.channel),
			});
		}

		const displayVolumeValue = channelAudio.volume;
		const displayVolumeText = channelAudio.isMuted
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
