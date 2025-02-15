declare module '@xenova/transformers' {
  export const pipeline: any;
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