/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import styles from "./peoplePicker.module.scss";
import { useSelector } from "react-redux";
import { CONFIG } from "../../../config/config";

const CustomPeoplePicker: React.FC<any> = ({
  onChange,
  placeholder = "User",
  personSelectionLimit,
  selectedItem,
  size,
  withLabel,
  labelText,
  disabled,
  isValid,
  errorMsg,
  readOnly,
  noErrorMsg = false,
  mandatory,
  multiUsers = false,
  groupName,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const mainContext: any = useSelector(
    (state: any) => state.MainSPContext.value
  );

  const selectedUserItem = selectedItem
    ? selectedItem?.filter((item: any) => item !== undefined && item !== null)
    : [];

  const handleChange = (items: any[]): void => {
    const obj = items?.map((item: any) => ({
      id: item.id,
      email: item?.secondaryText,
      name: item?.text,
    }));
    setIsFocused(true);
    onChange && onChange(obj);
  };

  useEffect(() => {
    if (selectedUserItem?.length) {
      setIsFocused(true);
    }

    // else {
    //   setIsFocused(false);
    // }
  }, [selectedItem, isFocused]);

  return (
    <div
      className={styles.inputMainWrapper}
      style={{
        marginBottom: !noErrorMsg && !isValid ? "15px" : "0",
      }}
    >
      <div
        // ref={pickerRef}
        className={`${styles.pickerWrapper} ${
          disabled ? styles.disabledInput : ""
        }`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <label
          className={`${styles.inputLabel} ${
            selectedUserItem.length || isFocused ? styles.active : ""
          } ${mandatory ? styles.mandatoryField : ""}`}
        >
          {labelText}
        </label>
        <PeoplePicker
          context={mainContext}
          webAbsoluteUrl={CONFIG.TenantDetail.webURL}
          personSelectionLimit={personSelectionLimit}
          showtooltip={false}
          ensureUser={true}
          onChange={handleChange}
          styles={{
            root: {
              minWidth: "100%",
              maxWidth: "100%",
            },
            text: {
              border: "0 !important",
              outline: "0 !important",
            },
          }}
          groupName={groupName ?? null}
          principalTypes={[PrincipalType.User]}
          defaultSelectedUsers={selectedUserItem}
          disabled={readOnly}
        />
      </div>
      {!noErrorMsg && !isValid && (
        <span className={styles.errorMsg}>{errorMsg}</span>
      )}
    </div>
  );
};

export default CustomPeoplePicker;
