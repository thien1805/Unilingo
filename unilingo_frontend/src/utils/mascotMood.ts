import { MascotMood } from '../components/common/Mascot';

export function getMascotMoodByOverall(overallScore: number): MascotMood {
  if (overallScore < 3.0) return 'sad';
  if (overallScore < 5.0) return 'idle';
  if (overallScore < 6.5) return 'happy';
  return 'cheer';
}

export function getMascotMoodByBandChange(
  previousBand: number | null,
  currentBand: number
): MascotMood {
  if (previousBand === null) return 'idle';

  const bandChange = currentBand - previousBand;
  if (bandChange >= 1.0) return 'cheer';
  if (currentBand > previousBand) return 'happy';
  if (currentBand < previousBand) return 'confused';
  return 'idle';
}
