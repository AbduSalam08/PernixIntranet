import RichText from "../../../../../components/common/RichText/RichText";
import SectionHeaderIntranet from "../../../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";

const Summary = ({ value }: any) => {
  console.log("value: ", value);
  return (
    <>
      <SectionHeaderIntranet label={"Summary"} />
      <RichText />
    </>
  );
};
export default Summary;
