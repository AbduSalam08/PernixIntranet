import * as React from "react";
import type { INewHiresIntranetProps } from "./INewHiresIntranetProps";
import MainComponent from "./MainComponent";

export default class NewHiresIntranet extends React.Component<
  INewHiresIntranetProps,
  {}
> {
  public render(): React.ReactElement<INewHiresIntranetProps> {
    return <MainComponent />;
  }
}
