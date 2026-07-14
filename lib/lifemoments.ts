import { Storyline } from '../store/usePregnancyStore';

interface LifeMomentConfig {
  needsRole: boolean;
}

export const LIFEMOMENT_CONFIG: Record<Storyline, LifeMomentConfig> = {
  pregnancy: { needsRole: true },
};
