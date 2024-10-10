import Button from "antd/es/button";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import messageKeys from "~utils/message-keys";
interface ComponentProps {
  title: string;
  description: string;
}

const Component: FC<ComponentProps> = ({ title, description }) => {
  const { t } = useTranslation();
  const handleClose = () => {
    window.close();
  };
  return (
    <div className="error-container">
      <div className="content">
        <div className="error-badge">
          <img width={20} height={20} src="/static/icons/error.svg" alt="" />
          <span className="error">{t(messageKeys.ERROR)}</span>
        </div>
        <span className="title">{title}</span>
        <p className="description">{description}</p>
      </div>
      <Button onClick={handleClose} type="default" shape="round" block>
        {t(messageKeys.CLOSE)}
      </Button>
    </div>
  );
};

export default Component;
