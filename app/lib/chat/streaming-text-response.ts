import { experimental_StreamData } from "./stream-data";
import { COMPLEX_HEADER } from "./utils";

export class StreamingTextResponse extends Response {
    constructor(
      res: ReadableStream,
      init?: ResponseInit,
      data?: experimental_StreamData,
    ) {
      let processedStream = res;
  
      if (data) {
        processedStream = res.pipeThrough(data.stream);
      }
  
      super(processedStream as any, {
        ...init,
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          [COMPLEX_HEADER]: data ? 'true' : 'false',
          ...init?.headers,
        },
      });
    }
  }