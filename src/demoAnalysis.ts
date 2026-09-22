export type CropId = 'rice' | 'wheat' | 'tomato' | 'potato' | 'cotton';
export type DiseaseId = 'healthy' | 'powdery_mildew' | 'leaf_spot' | 'late_blight' | 'root_rot' | 'yellow_rust';

export type AnalysisResult = {
  cropId: CropId;
  // diseaseId from real backend might not match our predefined ids.
  // We still keep it as string and fall back to API-provided text fields.
  diseaseId: string;
  confidence: number; // 0..1
  plantName?: string;
  diseaseName?: string;
  preventionText?: string;
  stepsText?: string;
};

export const cropOptions: Array<{ id: CropId }> = [
  { id: 'rice' },
  { id: 'wheat' },
  { id: 'tomato' },
  { id: 'potato' },
  { id: 'cotton' },
];

const diseasesByCrop: Record<CropId, DiseaseId[]> = {
  rice: ['leaf_spot', 'yellow_rust', 'healthy'],
  wheat: ['yellow_rust', 'powdery_mildew', 'healthy'],
  tomato: ['late_blight', 'leaf_spot', 'healthy'],
  potato: ['late_blight', 'root_rot', 'healthy'],
  cotton: ['powdery_mildew', 'leaf_spot', 'healthy'],
};

function hashString(input: string): number {
  // Simple deterministic hash for demo selection (no ML here).
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function demoAnalyzeCrop(cropId: CropId, photoUri: string | undefined | null): AnalysisResult {
  const uri = photoUri ?? '';
  const list = diseasesByCrop[cropId];
  const seed = hashString(`${cropId}:${uri}`) % list.length;
  const diseaseId = list[seed];

  // Produce a stable "confidence" based on the selected index.
  const confidenceBase = 0.58;
  const confidence = Math.min(0.93, confidenceBase + (seed % 7) * 0.05 + (uri.length % 13) * 0.002);

  return { cropId, diseaseId, confidence };
}

export const dummyLogin = {
  username: 'basavaraj',
  password: '1234',
};

