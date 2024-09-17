import { useState, type FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Upload, type UploadProps } from "antd";
import { readBarcodesFromImageFile, type ReaderOptions } from "zxing-wasm";

import { toCamelCase } from "~utils/case-converter";
import { ChainKey, chains, errorKey } from "~utils/constants";
import { getStoredVaults, setStoredVaults } from "~utils/storage";
import type { VaultProps } from "~utils/interfaces";
import useGoBack from "~hooks/go-back";
import messageKeys from "~utils/message-keys";
import routerKeys from "~utils/route-keys";

import { ChevronLeft, CrossShapeBold } from "~icons";

import qrCodeImgUrl from "raw:~/assets/images/qr-code.png";
import qrErrorImgUrl from "raw:~/assets/images/qr-error.png";
import qrSuccessImgUrl from "raw:~/assets/images/qr-success.png";
import uploadImgUrl from "raw:~/assets/images/upload.png";
import routeKeys from "~utils/route-keys";
import useAddress from "~hooks/get-address";

interface InitialState {
  file?: File;
  loading: boolean;
  status: "default" | "error" | "success";
  vault?: VaultProps;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { loading: false, status: "default" };
  const [state, setState] = useState(initialState);
  const { file, loading, status, vault } = state;
  const location = useLocation();
  const navigate = useNavigate();
  const getAddress = useAddress();
  const goBack = useGoBack();

  const handleStart = (): void => {
    if (!loading && vault && status === "success") {
      getStoredVaults().then((vaults) => {
        const defChains = chains.filter(({ isDefault }) => isDefault);
        const promises = defChains.map(({ chain }) => getAddress(chain, vault));

        setState((prevState) => ({ ...prevState, loading: true }));

        Promise.all(promises).then((addresses) => {
          vault.chains = defChains.map((chain, index) => ({
            ...chain,
            address: addresses[index],
          }));

          const existed = vaults.find(({ uid }) => uid === vault.uid);

          const modifiedVaults = existed
            ? vaults.map((item) =>
                item.uid === existed.uid
                  ? {
                      ...vault,
                      active: true,
                      name: item.name,
                    }
                  : { ...item, active: false }
              )
            : [
                { ...vault, active: true },
                ...vaults
                  .filter(({ uid }) => uid !== vault.uid)
                  .map((vault) => ({ ...vault, active: false })),
              ];

          setStoredVaults(modifiedVaults).then(() => {
            setState((prevState) => ({ ...prevState, loading: false }));

            navigate(routerKeys.main, { state: true });
          });
        });
      });
    }
  };

  const handleClear = (): void => {
    setState(initialState);
  };

  const handleError = (error: string) => {
    setState((prevState) => ({ ...prevState, status: "error" }));

    switch (error) {
      case errorKey.INVALID_EXTENSION:
        console.error("Invalid file extension");
        break;
      case errorKey.INVALID_FILE:
        console.error("Invalid file");
        break;
      case errorKey.INVALID_QRCODE:
        console.error("Invalid qr code");
        break;
      case errorKey.INVALID_VAULT:
        console.error("Invalid vault data");
        break;
      default:
        console.error("Someting is wrong");
        break;
    }
  };

  const handleUpload = (file: File): false => {
    setState(initialState);

    const reader = new FileReader();

    const imageFormats: string[] = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/bmp",
    ];

    reader.onload = () => {
      const readerOptions: ReaderOptions = {
        tryHarder: true,
        formats: ["QRCode"],
        maxNumberOfSymbols: 1,
      };

      setState((prevState) => ({ ...prevState, file }));

      readBarcodesFromImageFile(file, readerOptions)
        .then(([result]) => {
          if (result) {
            try {
              const vault: VaultProps = JSON.parse(result.text);

              setState((prevState) => ({
                ...prevState,
                vault: { ...toCamelCase(vault), chains: [] },
                status: "success",
              }));
            } catch {
              handleError(errorKey.INVALID_VAULT);
            }
          }
        })
        .catch(() => {
          handleError(errorKey.INVALID_QRCODE);
        });
    };

    reader.onerror = () => {
      handleError(errorKey.INVALID_FILE);
    };

    if (imageFormats.indexOf(file.type) >= 0) {
      reader.readAsDataURL(file);
    } else {
      handleError(errorKey.INVALID_EXTENSION);
    }

    return false;
  };

  const props: UploadProps = {
    multiple: false,
    showUploadList: false,
    beforeUpload: handleUpload,
    fileList: [],
  };

  return (
    <div className="layout import-page">
      <div className="header">
        <span className="heading">{t(messageKeys.IMPORT_VAULT)}</span>
        {location.state && (
          <ChevronLeft
            className="icon icon-left"
            onClick={() => goBack(routeKeys.main)}
          />
        )}
      </div>
      <div className="content">
        <Upload.Dragger {...props} className={status}>
          <div className="state state-default">
            <img src={qrCodeImgUrl} className="icon" />
            <span className="title">{t(messageKeys.ADD_VAULT_QRCODE)}</span>
            <span className="desc">
              {t(messageKeys.DROP_FILE_HERE_OR)}{" "}
              <u>{t(messageKeys.UPLOAD_IT)}</u>
            </span>
          </div>
          <div className="state state-hover">
            <img src={uploadImgUrl} className="icon" />
            <span className="title">{t(messageKeys.DROP_FILE_HERE)}</span>
          </div>
          <div className="state state-done">
            <span className="msg">
              {status === "error"
                ? t(messageKeys.IMPORT_FAILED)
                : t(messageKeys.IMPORT_SUCCESSED)}
            </span>
            <img
              src={status === "error" ? qrErrorImgUrl : qrSuccessImgUrl}
              className="image"
            />
            {file?.name && <span className="name">{file.name}</span>}
          </div>
        </Upload.Dragger>

        {status !== "default" && (
          <CrossShapeBold className="clear" onClick={handleClear} />
        )}

        <span className="hint">{t(messageKeys.FIND_YOUR_QRCODE)}</span>
      </div>
      <div className="footer">
        <Button
          shape="round"
          type="primary"
          disabled={status !== "success"}
          loading={loading}
          onClick={handleStart}
          block
        >
          {t(messageKeys.IMPORT_VAULT)}
        </Button>
      </div>
    </div>
  );
};

export default Component;
