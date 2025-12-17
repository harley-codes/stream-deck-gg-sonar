import { Sonar, Channel } from "steelseries-sonar-js";
import { SonarVolumeData } from "../models/SonarVolumeData";
import { SonarChannel } from "../types/sonarChannel";
import { sonarGetChannelFromSdk } from "./sonarGetChannelFromSdk";
import { sonarGetChannelVolumeAsync } from "./sonarGetChannelVolumeAsync";
import { clampVolume } from "./clampVolume";

export async function sonarOffsetChannelVolumeAsync(
	channel: SonarChannel,
	offset: number
): Promise<number> {
	try {
		const sonar = await Sonar.init();
		const volumeData = await sonarGetChannelVolumeAsync(channel);
		var sonarChannel = sonarGetChannelFromSdk(channel);
		await sonar.setVolume(
			sonarChannel,
			clampVolume(volumeData + offset, true)
		);
		return await sonarGetChannelVolumeAsync(channel);
	} catch {
		return -1;
	}
}
