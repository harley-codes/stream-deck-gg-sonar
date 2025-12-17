import { Sonar, Channel } from "steelseries-sonar-js";
import { SonarVolumeData } from "../models/SonarVolumeData";
import { SonarChannel } from "../types/sonarChannel";

export async function sonarGetChannelVolumeAsync(
	channel: SonarChannel
): Promise<number> {
	try {
		const sonar = await Sonar.init();
		const volumeData = (await sonar.getVolumeData()) as SonarVolumeData;
		switch (channel) {
			case "master":
				return volumeData.masters.classic.volume;
			case "game":
				return volumeData.devices.game?.classic.volume ?? -1;
			case "chat":
				return volumeData.devices.chatRender?.classic.volume ?? -1;
			case "media":
				return volumeData.devices.media?.classic.volume ?? -1;
			case "aux":
				return volumeData.devices.aux?.classic.volume ?? -1;
			case "mic":
				return volumeData.devices.chatCapture?.classic.volume ?? -1;
			default:
				return -1;
		}
	} catch {
		return -1;
	}
}
