import {
	action,
	DialAction,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveSettingsEvent,
	SingletonAction,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";

import { getChannelDisplayName } from "../functions/getChannelDisplayName";
import { getStreamerIcon } from "../functions/getStreamerIcon";
import { ELGATO_GREY } from "../const/elgatoColors";
import {
	AudioChannel,
	getAppEndpoint,
	getAudioDataStream,
	getSonarEndpointCached,
	setChannelMuteStreamer,
	setChannelVolumeStreamer,
	StreamerPath,
} from "steelseries-sonar-sdk";

type ActionSettings = {
	channel?: AudioChannel;
	currentType: StreamerPath;
	changeSpeed: number;
	pollingSpeed: number;
};

@action({ UUID: "com.harleycodes.steelseries-gg-sonar.channel-dial-streamer" })
export class ChannelDialStreamer extends SingletonAction<ActionSettings> {
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
		if (!settings.currentType)
			settings.currentType = StreamerPath.Monitoring;
		if (!settings.changeSpeed) settings.changeSpeed = 5;
		if (!settings.pollingSpeed) settings.pollingSpeed = 750;

		ev.action.setFeedback({
			icon1: getStreamerIcon(
				StreamerPath.Monitoring,
				settings.currentType === StreamerPath.Monitoring,
			),
			icon2: getStreamerIcon(
				StreamerPath.Streaming,
				settings.currentType === StreamerPath.Streaming,
			),
		});

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

		const audioData = await getAudioDataStream(endpoint);
		const channelAudio = audioData[settings.channel];
		if (!channelAudio) return;

		const displayVolumeValueStream = channelAudio.streaming.volume;
		const displayVolumeValueMonitor = channelAudio.monitoring.volume;

		ev.action.setFeedback({
			indicator1: displayVolumeValueMonitor,
			indicator2: displayVolumeValueStream,
		});
	}

	override async onDialRotate(
		ev: DialRotateEvent<ActionSettings>,
	): Promise<void> {
		var settings = ev.payload.settings;
		if (!settings.channel) return;

		const endpoint = await this.getEndpoint();
		if (!endpoint) return;

		const audioData = await getAudioDataStream(endpoint);
		let channelAudio = audioData[settings.channel];
		if (!channelAudio) return;

		var volumeOffset = ev.payload.ticks * settings.changeSpeed;
		var newVolume =
			channelAudio[settings.currentType].volume + volumeOffset;

		const pathAudio = await setChannelVolumeStreamer(
			endpoint,
			newVolume,
			settings.channel,
			settings.currentType,
		);

		if (settings.currentType === StreamerPath.Monitoring) {
			ev.action.setFeedback({
				indicator1: pathAudio.volume,
			});
		} else {
			ev.action.setFeedback({
				indicator2: pathAudio.volume,
			});
		}
	}

	override async onDialUp(ev: DialUpEvent<ActionSettings>): Promise<void> {
		var settings = ev.payload.settings;
		if (!settings.channel) return;

		const endpoint = await this.getEndpoint();
		if (!endpoint) return;

		const audioData = await getAudioDataStream(endpoint);
		let channelAudio = audioData[settings.channel];
		if (!channelAudio) return;

		const isMuted = !channelAudio[settings.currentType].isMuted;

		const pathAudio = await setChannelMuteStreamer(
			endpoint,
			isMuted,
			settings.channel,
			settings.currentType,
		);

		const indicatorValue = {
			value: pathAudio.volume,
			bar_fill_c: pathAudio.isMuted ? "#FF0000" : "#ffffff",
			bar_bg_c: pathAudio.isMuted ? "#823333" : ELGATO_GREY,
		};

		if (settings.currentType === StreamerPath.Monitoring) {
			ev.action.setFeedback({
				indicator1: indicatorValue,
			});
		} else {
			ev.action.setFeedback({
				indicator2: indicatorValue,
			});
		}
	}

	override async onTouchTap(
		ev: TouchTapEvent<ActionSettings>,
	): Promise<void> {
		var settings = ev.payload.settings;
		if (!settings.channel) return;
		settings.currentType =
			settings.currentType === StreamerPath.Monitoring
				? StreamerPath.Streaming
				: StreamerPath.Monitoring;
		ev.action.setSettings(settings);
		ev.action.setFeedback({
			icon1: getStreamerIcon(
				StreamerPath.Monitoring,
				settings.currentType === StreamerPath.Monitoring,
			),
			icon2: getStreamerIcon(
				StreamerPath.Streaming,
				settings.currentType === StreamerPath.Streaming,
			),
		});
	}

	private async updateDisplay(action: DialAction<ActionSettings>) {
		try {
			if (!action.isDial()) return;

			var settings = await action.getSettings();
			if (!settings.channel) return;

			const endpoint = await this.getEndpoint();
			if (!endpoint) return;

			const audioData = await getAudioDataStream(endpoint);
			let channelAudio = audioData[settings.channel];

			if (!channelAudio) {
				return action.setFeedback({
					icon: "",
					indicator: 0,
					value: "",
					title: getChannelDisplayName(settings.channel),
				});
			}

			const displayVolumeValueStream =
				channelAudio[StreamerPath.Streaming].volume;
			const displayVolumeValueMonitor =
				channelAudio[StreamerPath.Monitoring].volume;
			const volumeMutedStream =
				channelAudio[StreamerPath.Streaming].isMuted;
			const volumeMutedMonitor =
				channelAudio[StreamerPath.Monitoring].isMuted;

			action.setFeedback({
				indicator1: {
					value: displayVolumeValueMonitor,
					bar_fill_c: volumeMutedMonitor ? "#FF0000" : "#ffffff",
				},
				indicator2: {
					value: displayVolumeValueStream,
					bar_fill_c: volumeMutedStream ? "#FF0000" : "#ffffff",
				},
				title: getChannelDisplayName(settings.channel),
			});
		} catch (e) {
			const err = e as Error;
			console.log(
				`Error in Channel Dial Streamer updateDisplay: ${err.message}`,
			);
		}
	}
}
