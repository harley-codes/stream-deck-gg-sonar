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
import { SonarChannel } from "../types/sonarChannel";
import {
	getChannelDataStreamer,
	offsetChannelVolumeStream,
	toggleChannelMuteStream,
} from "../modules/sonar";
import { getChannelIcon } from "../functions/getChannelIcon";
import { StreamType } from "../types/streamTypes";
import { getStreamerIcon } from "../functions/getStreamerIcon";
import { ELGATO_GREY } from "../const/elgatoColors";

type ActionSettings = {
	channel?: SonarChannel;
	currentType: StreamType;
	changeSpeed: number;
	pollingSpeed: number;
};

@action({ UUID: "com.harleycodes.steelseries-gg-sonar.channel-dial-streamer" })
export class ChannelDialStreamer extends SingletonAction<ActionSettings> {
	private intervalId: NodeJS.Timeout | null = null;

	override async onWillAppear(
		ev: WillAppearEvent<ActionSettings>
	): Promise<void> {
		if (!ev.action.isDial()) return;

		var settings = ev.payload.settings;
		if (!settings.channel) settings.channel = "master";
		if (!settings.currentType) settings.currentType = "monitoring";
		if (!settings.changeSpeed) settings.changeSpeed = 5;
		if (!settings.pollingSpeed) settings.pollingSpeed = 750;

		ev.action.setFeedback({
			icon1: getStreamerIcon(
				"monitoring",
				settings.currentType === "monitoring"
			),
			icon2: getStreamerIcon(
				"streaming",
				settings.currentType === "streaming"
			),
		});

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

		const data = await getChannelDataStreamer(settings.channel);
		if (data === null) return;

		const displayVolumeValueStream = data.streaming.volume * 100;
		const displayVolumeValueMonitor = data.monitoring.volume * 100;

		ev.action.setFeedback({
			indicator1: displayVolumeValueMonitor,
			indicator2: displayVolumeValueStream,
		});
	}

	override async onDialRotate(
		ev: DialRotateEvent<ActionSettings>
	): Promise<void> {
		var settings = ev.payload.settings;
		if (!settings.channel) return;

		var amount = ev.payload.ticks * settings.changeSpeed;
		var data = await offsetChannelVolumeStream(
			settings.channel,
			amount,
			settings.currentType
		);

		if (data === null) return;

		const displayVolumeValueStream = data.streaming.volume * 100;
		const displayVolumeValueMonitor = data.monitoring.volume * 100;

		ev.action.setFeedback({
			indicator1: displayVolumeValueMonitor,
			indicator2: displayVolumeValueStream,
		});
	}

	override async onDialUp(ev: DialUpEvent<ActionSettings>): Promise<void> {
		var settings = ev.payload.settings;
		if (!settings.channel) return;

		var data = await toggleChannelMuteStream(
			settings.channel,
			settings.currentType
		);

		if (data === null) return;

		const displayVolumeValueStream = data.streaming.volume * 100;
		const displayVolumeValueMonitor = data.monitoring.volume * 100;
		const volumeMutedStream = data.streaming.muted;
		const volumeMutedMonitor = data.monitoring.muted;

		ev.action.setFeedback({
			indicator1: {
				value: displayVolumeValueMonitor,
				bar_fill_c: volumeMutedMonitor ? "#FF0000" : "#ffffff",
				bar_bg_c: volumeMutedMonitor ? "#823333" : ELGATO_GREY,
			},
			indicator2: {
				value: displayVolumeValueStream,
				bar_fill_c: volumeMutedStream ? "#FF0000" : "#ffffff",
				bar_bg_c: volumeMutedStream ? "#823333" : ELGATO_GREY,
			},
			icon1: getStreamerIcon(
				"monitoring",
				settings.currentType === "monitoring"
			),
			icon2: getStreamerIcon(
				"streaming",
				settings.currentType === "streaming"
			),
		});
	}

	override async onTouchTap(
		ev: TouchTapEvent<ActionSettings>
	): Promise<void> {
		var settings = ev.payload.settings;
		if (!settings.channel) return;
		settings.currentType =
			settings.currentType === "monitoring" ? "streaming" : "monitoring";
		ev.action.setSettings(settings);
		ev.action.setFeedback({
			icon1: getStreamerIcon(
				"monitoring",
				settings.currentType === "monitoring"
			),
			icon2: getStreamerIcon(
				"streaming",
				settings.currentType === "streaming"
			),
		});
	}

	private async updateDisplay(action: DialAction<ActionSettings>) {
		try {
			if (!action.isDial()) return;

			var settings = await action.getSettings();
			if (!settings.channel) return;

			var data = await getChannelDataStreamer(settings.channel);
			if (data === null)
				return action.setFeedback({
					icon: "",
					indicator: 0,
					value: "",
					title: getChannelDisplayName(settings.channel),
				});

			const displayVolumeValueStream = data.streaming.volume * 100;
			const displayVolumeValueMonitor = data.monitoring.volume * 100;
			const volumeMutedStream = data.streaming.muted;
			const volumeMutedMonitor = data.monitoring.muted;

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
				`Error in Channel Dial Streamer updateDisplay: ${err.message}`
			);
		}
	}
}
