import { Sonar } from "steelseries-sonar-js";
import { SonarChannel } from "../types/sonarChannel";
import { sonarGetChannelFromSdk } from "./sonarGetChannelFromSdk";
import { sonarGetChannelMuteAsync } from "./sonarGetChannelMuteAsync";

export async function sonarToggleChannelMuteAsync(
	channel: SonarChannel
): Promise<boolean | undefined> {
	try {
		const sonar = await Sonar.init();
		var sonarChannel = sonarGetChannelFromSdk(channel);
		var isMuted = await sonarGetChannelMuteAsync(channel);
		await sonar.muteChannel(sonarChannel, !isMuted);
		return !isMuted;
	} catch {}
}
