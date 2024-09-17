import { Tabs, Tab } from "@mui/material";
import styles from "./SliderButton.module.scss";
import { memo } from "react";

// Props interface
interface IProps {
  options: string[];
  onChange: (value: string) => void;
  value: number;
}

const SliderButton = ({ options, onChange, value }: IProps): JSX.Element => {
  const handleChange = (
    event: React.SyntheticEvent,
    newValue: number
  ): void => {
    onChange(options[newValue]);
  };

  return (
    <div className={`${styles.sliderButton} sliderButton`}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="icon label tabs example"
      >
        {options.map((data: string, index: number) => (
          <Tab value={index} key={index} label={data} />
        ))}
      </Tabs>
    </div>
  );
};

export default memo(SliderButton);
