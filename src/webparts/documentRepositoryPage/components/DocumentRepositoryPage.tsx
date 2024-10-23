/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";

const DocumentRepositoryPage = (props: any): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onLoadingFUN = async (): Promise<void> => {
    setIsLoading(false);
  };

  useEffect(() => {
    onLoadingFUN();
  }, []);

  return isLoading ? <CircularSpinner /> : <div>Document Repository Page</div>;
};

export default DocumentRepositoryPage;
