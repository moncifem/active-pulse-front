declare module '@xenova/transformers' {
  export const pipeline: unknown;
  export const env: {
    useBrowserCache: boolean;
    allowLocalModels: boolean;
    backends: {
      onnx: {
        wasm: {
          numThreads: number;
        };
      };
    };
  };
}

export type Pipeline = unknown; 