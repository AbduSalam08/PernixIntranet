/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useCallback } from "react";
import { IComboBox, TimePicker } from "@fluentui/react";

interface ITimeRange {
  start: number;
  end: number;
}

interface ITimeInputProps {
  label?: string;
  placeholder?: string;
  dateAnchor?: Date;
  value: any;
  allowFreeform?: boolean;
  timeRange?: ITimeRange;
  onChange?: any;
  error?: boolean;
  errorMsg?: string;
  disabled?: boolean;
}

const CustomTimePicker: React.FC<ITimeInputProps> = ({
  label,
  placeholder,
  dateAnchor,
  value,
  allowFreeform = false,
  timeRange = {
    start: 0,
    end: 0,
  },
  onChange,
  error,
  errorMsg,
  disabled = false,
}) => {
  const handleChange = useCallback(
    (e: any) => {
      onChange(e.value);
    },
    [onChange]
  );

  return (
    <div>
      <TimePicker
        disabled={disabled}
        placeholder={placeholder}
        dateAnchor={dateAnchor}
        value={value}
        allowFreeform={allowFreeform}
        timeRange={timeRange}
        onChange={(_ev: React.FormEvent<IComboBox>, date: Date) => {
          handleChange(date);
        }}
        ariaLabel="Time picker"
      />
    </div>
  );
};

export default memo(CustomTimePicker);
