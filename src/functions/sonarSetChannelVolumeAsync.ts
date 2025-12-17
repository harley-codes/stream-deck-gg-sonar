import { Sonar, Channel } from "steelseries-sonar-js";
import { SonarVolumeData } from "../models/SonarVolumeData";
import { SonarChannel } from "../types/sonarChannel";
import { sonarGetChannelFromSdk } from "./sonarGetChannelFromSdk";
import { sonarGetChannelVolumeAsync } from "./sonarGetChannelVolumeAsync";

export async function sonarSetChannelVolumeAsync(
	channel: SonarChannel,
	volume: number
): Promise<number> {
	try {
		const sonar = await Sonar.init();
		var sonarChannel = sonarGetChannelFromSdk(channel);
		await sonar.setVolume(sonarChannel, volume);
		return await sonarGetChannelVolumeAsync(channel);
	} catch {
		return -1;
	}
}
