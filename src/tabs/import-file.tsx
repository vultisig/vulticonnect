import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button, Upload, type UploadProps } from "antd";
import { readBarcodesFromImageFile, type ReaderOptions } from "zxing-wasm";
import { toCamelCase } from "~utils/functions";
import { chains, errorKey } from "~utils/constants";
import { getStoredVaults, setStoredVaults } from "~utils/storage";
import type { VaultProps } from "~utils/interfaces";
import AddressProvider from "~utils/address-provider";
import WalletCoreProvider from "~utils/wallet-core-provider";
import messageKeys from "~utils/message-keys";
import { CrossShapeBold } from "~icons";
import "~styles/index.scss";
import "~popup/index.scss";
import "./import-file.scss";

interface InitialState {
  file?: File | Blob;
  loading: boolean;
  status: "default" | "error" | "success";
  vault?: VaultProps;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { loading: false, status: "default" };
  const [state, setState] = useState(initialState);
  const { file, loading, status, vault } = state;
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

            handleClose();
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
                  handleClose();
                  // navigate(routeKeys.main, { state: true });
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

  const handleClose = () => {
    window.close();
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

  const handleUpload = (file: File | Blob): false => {
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
                  customTransactions: [],
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
  );
};

export default Component;
