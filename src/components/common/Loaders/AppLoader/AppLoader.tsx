/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @microsoft/spfx/import-requires-chunk-name */

import styles from "./AppLoader.module.scss";
const logo = require("../../../../assets/images/svg/pernixGroupsLogo.svg");

const AppLoader = (): JSX.Element => {
  return (
    <div className={styles.ApploaderWrapper}>
      <img src={logo} alt="App logo" />
    </div>
  );
};

export default AppLoader;
