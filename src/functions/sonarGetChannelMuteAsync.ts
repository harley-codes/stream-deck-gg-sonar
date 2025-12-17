import { Sonar, Channel } from "steelseries-sonar-js";
import { SonarVolumeData } from "../models/SonarVolumeData";
import { SonarChannel } from "../types/sonarChannel";

export async function sonarGetChannelMuteAsync(
	channel: SonarChannel
): Promise<boolean | undefined> {
	try {
		const sonar = await Sonar.init();
		const volumeData = (await sonar.getVolumeData()) as SonarVolumeData;
		switch (channel) {
			case "master":
				return volumeData.masters.classic.muted;
			case "game":
				return volumeData.devices.game?.classic.muted;
			case "chat":
				return volumeData.devices.chatRender?.classic.muted;
			case "media":
				return volumeData.devices.media?.classic.muted;
			case "aux":
				return volumeData.devices.aux?.classic.muted;
			case "mic":
				return volumeData.devices.chatCapture?.classic.muted;
		}
	} catch {}
}
