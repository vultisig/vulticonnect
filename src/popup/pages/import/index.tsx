import { useEffect, useState, type FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Upload, type UploadProps } from "antd";
import { readBarcodesFromImageFile, type ReaderOptions } from "zxing-wasm";
import { UAParser } from "ua-parser-js";
import { toCamelCase } from "~utils/functions";
import { chains, errorKey } from "~utils/constants";
import { getStoredVaults, setStoredVaults } from "~utils/storage";
import type { VaultProps } from "~utils/interfaces";
import useGoBack from "~hooks/go-back";
import AddressProvider from "~utils/address-provider";
import WalletCoreProvider from "~utils/wallet-core-provider";
import messageKeys from "~utils/message-keys";
import routeKeys from "~utils/route-keys";

import { ChevronLeft, CrossShapeBold } from "~icons";

interface InitialState {
  file?: File;
  loading: boolean;
  status: "default" | "error" | "success";
  vault?: VaultProps;
  isWindows?: boolean;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    loading: false,
    status: "default",
    isWindows: true,
  };
  const [state, setState] = useState(initialState);
  const { file, loading, status, vault } = state;
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const walletCore = new WalletCoreProvider();

  const handleStart = (): void => {
    if (!loading && vault && status === "success") {
      getStoredVaults().then((vaults) => {
        const existed = vaults.findIndex(({ uid }) => uid === vault.uid) >= 0;

        setState((prevState) => ({ ...prevState, loading: true }));

        if (existed) {
          const modifiedVaults = vaults.map((item) => ({
            ...item,
            active: item.uid === vault.uid,
          }));

          setStoredVaults(modifiedVaults).then(() => {
            setState((prevState) => ({ ...prevState, loading: false }));

            navigate(routeKeys.main, { state: true });
          });
        } else {
          walletCore
            .getCore()
            .then(({ chainRef, walletCore }) => {
              const addressProvider = new AddressProvider(chainRef, walletCore);

              const modifiedChains = chains.filter(({ id }) => !!id);
              const promises = modifiedChains.map(({ name }) =>
                addressProvider.getAddress(name, vault)
              );

              Promise.all(promises).then((props) => {
                vault.chains = modifiedChains.map((chain, index) => ({
                  ...chain,
                  ...props[index],
                }));

                const modifiedVaults = [
                  { ...vault, active: true },
                  ...vaults
                    .filter(({ uid }) => uid !== vault.uid)
                    .map((vault) => ({ ...vault, active: false })),
                ];

                setStoredVaults(modifiedVaults).then(() => {
                  setState((prevState) => ({ ...prevState, loading: false }));

                  navigate(routeKeys.main, { state: true });
                });
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
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
                vault: {
                  ...toCamelCase(vault),
                  apps: [],
                  chains: [],
                  transactions: [],
                },
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

  const componentDidMount = (): void => {
    let parser = new UAParser();
    let parserResults = parser.getResult();
    if (parserResults.os.name != "Windows") {
      setState({ ...state, isWindows: false });
      chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
        let createdWindowId: number;
        const height = 639;
        const width = 376;
        let left = 0;
        let top = 0;

        if (
          currentWindow &&
          currentWindow.left !== undefined &&
          currentWindow.top !== undefined &&
          currentWindow.width !== undefined
        ) {
          left = currentWindow.left + currentWindow.width - width;
          top = currentWindow.top;
        }
        chrome.windows.create(
          {
            url: chrome.runtime.getURL("tabs/import-file.html"),
            type: "panel",
            height,
            left,
            top,
            width,
          },
          (window) => {
            createdWindowId = window.id;
          }
        );

        chrome.windows.onRemoved.addListener((closedWindowId) => {
          if (closedWindowId === createdWindowId) {
            navigate(routeKeys.main, { state: true });
          }
        });
      });
    }
  };

  useEffect(componentDidMount, []);
  const props: UploadProps = {
    multiple: false,
    showUploadList: false,
    beforeUpload: handleUpload,
    fileList: [],
  };

  return state.isWindows ? (
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
            <img src="/static/images/qr-code.png" className="icon" />
            <span className="title">{t(messageKeys.ADD_VAULT_QRCODE)}</span>
            <span className="desc">
              {t(messageKeys.DROP_FILE_HERE_OR)}{" "}
              <u>{t(messageKeys.UPLOAD_IT)}</u>
            </span>
          </div>
          <div className="state state-hover">
            <img src="/static/images/upload.png" className="icon" />
            <span className="title">{t(messageKeys.DROP_FILE_HERE)}</span>
          </div>
          <div className="state state-done">
            <span className="msg">
              {status === "error"
                ? t(messageKeys.IMPORT_FAILED)
                : t(messageKeys.IMPORT_SUCCESSED)}
            </span>
            <img
              src={
                status === "error"
                  ? "/static/images/qr-error.png"
                  : "/static/images/qr-success.png"
              }
              className="image"
            />
            {(file as File)?.name && (
              <span className="name">{(file as File).name}</span>
            )}
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
  ) : (
    <div className="layout import-page">
      <div className="content">
        <div className="hint">{t(messageKeys.CONTINE_IN_NEW_WINDOW)}</div>
      </div>
    </div>
  );
};

export default Component;
