/* eslint-disable @typescript-eslint/no-explicit-any */
const ViewAll = (viewClick?: any): JSX.Element => {
  return (
    <div className="viewAllSection">
      <button onClick={viewClick}>View all</button>
    </div>
  );
};

export default ViewAll;
