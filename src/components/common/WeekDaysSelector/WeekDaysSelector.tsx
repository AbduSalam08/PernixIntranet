/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import styles from "./WeekDaysSelector.module.scss";

interface IWeekDaysSelector {
  multiSelect: boolean;
  onChange?: (selectedDays: string[] | string) => void;
  isValid?: boolean;
  errorMsg?: string;
  selectedValue?: string[] | string; // Default selected days
}

const WeekDaysSelector = ({
  multiSelect,
  onChange,
  selectedValue = multiSelect ? [] : "",
  isValid = true,
  errorMsg,
}: IWeekDaysSelector): JSX.Element => {
  const [days, setDays] = useState(
    [
      { label: "M", value: "Monday", isSelected: false },
      { label: "T", value: "Tuesday", isSelected: false },
      { label: "W", value: "Wednesday", isSelected: false },
      { label: "T", value: "Thursday", isSelected: false },
      { label: "F", value: "Friday", isSelected: false },
      { label: "S", value: "Saturday", isSelected: false },
      { label: "S", value: "Sunday", isSelected: false },
    ].map((day) => ({
      ...day,
      isSelected: Array.isArray(selectedValue)
        ? selectedValue.includes(day.value)
        : selectedValue === day.value,
    }))
  );

  const handleButtonClick = (dayValue: string): void => {
    setDays((prevDays) => {
      const updatedDays = multiSelect
        ? prevDays.map((day) =>
            day.value === dayValue
              ? { ...day, isSelected: !day.isSelected }
              : day
          )
        : prevDays.map((day) =>
            day.value === dayValue
              ? { ...day, isSelected: !day.isSelected }
              : { ...day, isSelected: false }
          );

      const selectedDays = updatedDays
        .filter((day) => day.isSelected)
        .map((day) => day.value);
      onChange?.(multiSelect ? selectedDays : selectedDays[0] || "");
      return updatedDays;
    });
  };

  useEffect(() => {
    if (selectedValue) {
      setDays((prevDays) =>
        prevDays.map((day) => ({
          ...day,
          isSelected: Array.isArray(selectedValue)
            ? selectedValue.includes(day.value)
            : selectedValue === day.value,
        }))
      );
    }
  }, [selectedValue]);

  return (
    <div className={styles.daysWrapper}>
      <div className={styles.daysBtnWrapper}>
        {days?.map((day: any) => (
          <button
            key={day.value}
            onClick={() => handleButtonClick(day.value)}
            style={{
              backgroundColor: day.isSelected ? "#006672" : "#fff",
              color: day.isSelected ? "#fff" : "#000",
              borderColor: day.isSelected ? "transparent" : "#adadad70",
            }}
            className={styles.daysBtn}
          >
            {day?.label}
          </button>
        ))}
      </div>
      {!isValid && errorMsg && (
        <div className={styles.errorMsg}>{errorMsg}</div>
      )}
    </div>
  );
};

export default WeekDaysSelector;
