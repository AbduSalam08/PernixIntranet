/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/self-closing-comp */
import { TreeSelect } from "primereact/treeselect";
import styles from "./Inputs.module.scss";
import { memo, useCallback, useState } from "react";
import CustomInput from "./CustomInput";
import { emptyCheck } from "../../../utils/validations";

interface Props {
  value: string | number | any;
  onChange: (value: string | any) => void;
  placeholder?: string;
  options: any;
  isValid?: any;
  errorMsg?: string;
  withLabel?: boolean;
  labelText?: string;
  size?: "SM" | "MD" | "XL";
  customWrapperClass?: any;
  disabled?: any;
}
const CustomTreeDropDown: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "",
  options,
  isValid,
  errorMsg,
  withLabel,
  labelText,
  customWrapperClass,
  disabled = false,
  size = "MD",
}): JSX.Element => {
  const [filterValue, setFilterValue] = useState("");
  const [optionsValue, setOptionsValue] = useState(options);

  const handleFilterValueChange = useCallback(
    (value: any) => {
      // here we trim filter proxy value, to filter by trimmed string in TreeSelect list
      setFilterValue(value);
      const filteredValue = value;

      if (emptyCheck(value)) {
        setOptionsValue(filteredValue);
      } else {
        setOptionsValue(options);
      }
    },
    [filterValue]
  );

  return (
    <>
      <div
        className={`${
          withLabel ? styles.inputWrapperWithLabel : styles.inputWrapper
        }`}
      >
        {withLabel && <p className={styles.inputLabel}>{labelText}</p>}
        <TreeSelect
          style={{
            padding: "0 10px",
          }}
          disabled={disabled}
          value={value}
          onChange={(e: any) => {
            onChange(e.value);
          }}
          options={optionsValue}
          panelHeaderTemplate={
            <CustomInput
              onChange={handleFilterValueChange}
              value={filterValue}
              inputWrapperClassName={styles.pathSearchFilter}
              size="SM"
              placeholder="Search path"
            />
          }
          className={`${styles.treeSelect} customTreeSelect w-full ${
            styles[`customInput${size}`]
          } ${isValid ? styles.errorInput : ""}`}
          // selectionMode="multiple"
          // selectionMode="single"
          placeholder={placeholder}
          filter
          filterValue={filterValue}
          filterPlaceholder="search path"
          // display="chip"
          // showClear={true}
          // filterBy="label,value"
        />
      </div>
      {isValid && (
        <p
          className={styles.errorMsg}
          style={{
            textAlign: isValid && !withLabel ? "left" : "right",
          }}
        >
          {errorMsg}
        </p>
      )}
    </>
  );
};
export default memo(CustomTreeDropDown);
