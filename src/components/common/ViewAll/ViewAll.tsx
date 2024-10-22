/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  onClick?: () => any;
}
const ViewAll = ({ onClick }: Props): JSX.Element => {
  return (
    <div className="viewAllSection">
      <button onClick={onClick}>View all</button>
    </div>
  );
};

export default ViewAll;
