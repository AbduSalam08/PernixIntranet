/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useCallback } from "react";
import styles from "./Inputs.module.scss";
import { Calendar } from "primereact/calendar";
import * as dayjs from "dayjs";
import { FloatLabel } from "primereact/floatlabel";

interface DDateInputProps {
  label?: string;
  disabledInput?: boolean;
  fromDate?: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  value: any;
  onChange?: any;
  error?: boolean;
  readOnly?: boolean;
  mandatory?: boolean;
  topLabel?: boolean;
  withLabel?: boolean;
  errorMsg?: string;
  customClass?: string;
  size?: string;
  placeHolder?: string;
  minWidth?: string;
  maxWidth?: string;
  isDateController?: boolean;
  minimumDate?: any;
  maximumDate?: any;
}

const DDateInput: React.FC<DDateInputProps> = ({
  label,
  disabledInput = false,
  fromDate,
  disablePast = false,
  disableFuture = false,
  placeHolder,
  value,
  onChange,
  readOnly,
  withLabel,
  topLabel,
  error = false,
  mandatory = false,
  errorMsg = "",
  customClass = "",
  size = "100%",
  maxWidth,
  minWidth,
  isDateController = false,
  minimumDate = null,
  maximumDate = null,
}) => {
  const handleChange = useCallback(
    (e: any) => {
      onChange(e.value);
    },
    [onChange]
  );

  // const defaultValue = value ? dayjs(value, "DD/MM/YYYY")?.toDate() : null;

  // Calculate minDate and maxDate based on props
  const today = dayjs().toDate();
  let minDate: any = undefined;
  let maxDate: any = undefined;

  if (isDateController) {
    minDate = minimumDate;
    maxDate = maximumDate;
  } else {
    minDate = disablePast ? today : undefined;
    maxDate = disableFuture ? today : undefined;
  }

  return (
    <div
      className={`${styles.inputMainWrapper} ${
        topLabel ? styles.topinputMainWrapper : ""
      }`}
      style={{
        width: size ? size : "auto",
        minWidth: minWidth ? minWidth : "auto",
        maxWidth: maxWidth ? maxWidth : "auto",
      }}
    >
      <div
        className={`${
          withLabel ? styles.inputWrapperWithLabel : styles.inputWrapper
        } ${disabledInput ? styles.disabledInput : ""} ${
          topLabel ? styles.topLabel : ""
        } `}
      >
        {withLabel && (
          <p
            style={{
              width: "42%",
              fontSize: "16px",
              color: "#414141",
              fontFamily: "interMedium, sans-serif",
            }}
          >
            {label}
          </p>
        )}
        {!readOnly ? (
          <FloatLabel>
            <Calendar
              value={value}
              onChange={(data: any) => {
                handleChange(data);
              }}
              disabled={disabledInput}
              minDate={minDate}
              maxDate={maxDate}
              showIcon
              monthNavigator
              yearNavigator
              yearRange="2000:2100"
              dateFormat="dd/mm/yy"
              placeholder={!value ? placeHolder : ""}
              className={`${styles.d_datepicker}`}
              style={{ width: "100%" }}
            />
            <label className={styles.flotingLabel} htmlFor="birth_date">
              {label}
            </label>
          </FloatLabel>
        ) : (
          <div style={{ width: "63%" }}>{value}</div>
        )}
      </div>
      {error && <p className={styles.errorMsg}>{errorMsg}</p>}
    </div>
  );
};

export default memo(DDateInput);
