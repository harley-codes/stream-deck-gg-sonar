export function clampVolume(volume: number, usingNormalized: boolean): number {
	if (usingNormalized) {
		if (volume < 0) return 0;
		if (volume > 1) return 1;
	} else {
		if (volume < 0) return 0;
		if (volume > 100) return 100;
	}
	return volume;
}
