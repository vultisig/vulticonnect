import { StrictMode, useEffect } from "react";
import { Navigate, RouterProvider, createHashRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { useTranslation } from "react-i18next";
import { getStoredLanguage } from "utils/storage";
import i18n from "i18n/config";
import routerKeys from "utils/route-keys";

import ConfigProvider from "components/config-provider";
import ImportPage from "pages/popup/pages/import";

import "styles/index.scss";
import "pages/popup/index.scss";
import { usePageInitialization } from "~src/hooks/usePageInitialization";

const router = createHashRouter(
  [
    {
      path: routerKeys.root,
      element: <ImportPage />,
    },
    {
      path: "*",
      element: <Navigate to={routerKeys.root} replace />,
    },
  ],
  {
    basename: routerKeys.basePath,
  }
);

const Component = () => {
  const { t } = useTranslation();

  useEffect(() => {
    usePageInitialization(t);
  }, []);

  return (
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Component />
  </StrictMode>
);
