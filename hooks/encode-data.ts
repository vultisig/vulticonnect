import { useState } from "react";
import SevenZip, { type SevenZipModule } from "7z-wasm";

import { errorKey } from "~utils/constants";

interface InitialState {
  compressor?: SevenZipModule;
}

const useEncoder = (): ((data: Uint8Array) => Promise<string>) => {
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { compressor } = state;

  const encoding = (
    compressor: SevenZipModule,
    data: Uint8Array
  ): Promise<string> => {
    return new Promise((resolve) => {
      const archiveName = "compressed.xz";

      compressor.FS.writeFile("data.bin", Buffer.from(data));
      compressor.callMain(["a", archiveName, "data.bin"]);

      const compressedData = compressor.FS.readFile(archiveName);

      resolve(Buffer.from(compressedData).toString("base64"));
    });
  };

  const dataEncoder = (data: Uint8Array): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (compressor) {
        encoding(compressor, data).then(resolve);
      } else {
        SevenZip()
          .then((compressor) => {
            setState((prevState) => ({ ...prevState, compressor }));

            encoding(compressor, data).then(resolve);
          })
          .catch(() => {
            reject(errorKey.FAIL_TO_INIT_WASM);
          });
      }
    });
  };

  return dataEncoder;
};

export default useEncoder;
