import * as React from "react";
import type { ICalendarIntranetProps } from "./ICalendarIntranetProps";
import MainComponent from "./MainComponent";
import { sp } from "@pnp/sp/presets/all";
import { graph } from "@pnp/graph/presets/all";

export default class CalendarIntranet extends React.Component<
  ICalendarIntranetProps,
  {}
> {
  constructor(prop: ICalendarIntranetProps) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
    graph.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }
  public render(): React.ReactElement<ICalendarIntranetProps> {
    return <MainComponent />;
  }
}
