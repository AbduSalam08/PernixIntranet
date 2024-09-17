import React from "react";
import type { IBirthdayIntranetProps } from "./IBirthdayIntranetProps";
import MainComponent from "./MainComponent";

export default class BirthdayIntranet extends React.Component<
  IBirthdayIntranetProps,
  {}
> {
  public render(): React.ReactElement<IBirthdayIntranetProps> {
    return <MainComponent />;
  }
}
