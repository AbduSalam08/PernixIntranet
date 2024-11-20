import QuestionCeo from "../components/QuestionCeo/QuestionCeoIntranet";
import PollIntranet from "../components/PollIntranet/PollIntranet";
import Shoutout from "../components/Shoutout/ShoutOutsIntranet";
import styles from "./FlexipleSectionsIntranet.module.scss";
import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import SpServices from "../../../services/SPServices/SpServices";
let temp = [];
const FlexipleSectionIntranet = (props: any) => {
  const [isPopup, setIsPopup] = useState(false); // Controls popup visibility
  const [selectedComponents, setSelectedComponents] = useState([
    "QuestionCeo",
    "PollIntranet",
    "Shoutout",
  ]);
  const [pollSelected, setPollSelected] = useState(true); // Tracks Poll checkbox state

  const handleConfirm = () => {
    setSelectedComponents((prev) => {
      if (pollSelected) {
        return prev.includes("PollIntranet") ? prev : [...prev, "PollIntranet"];
      } else {
        return prev.filter((component) => component !== "PollIntranet");
      }
    });
    setIsPopup(false);
  };

  const getData = () => {
    temp = [];
    SpServices.SPReadItems({
      Listname: "ShowComponent",
    })
      .then((res: any) => {
        temp = res.map((val: any) => ({
          Title: val.Title,
          IsActive: val.isActive,
        }));

        console.log("temp: ", temp);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getData();
  }, []);
  return (
    <>
      {/* Edit Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <i
          onClick={() => setIsPopup(true)}
          className="pi pi-pencil"
          style={{ fontSize: "1rem", color: "blue", cursor: "pointer" }}
        ></i>
      </div>

      {/* Components to Display */}
      <div className={styles.container}>
        {selectedComponents.includes("QuestionCeo") && (
          <div style={{ flex: "1 1 100%" }}>
            <QuestionCeo props={props} />
          </div>
        )}
        {selectedComponents.includes("PollIntranet") && (
          <div style={{ flex: "1 1 100%" }}>
            <PollIntranet props={props} />
          </div>
        )}
        {selectedComponents.includes("Shoutout") && (
          <div style={{ flex: "1 1 100%" }}>
            <Shoutout props={props} />
          </div>
        )}
      </div>

      {/* Popup Dialog */}
      <Dialog
        header="Select Option"
        visible={isPopup}
        showHeader={false}
        style={{ width: "35vw" }}
        onHide={() => setIsPopup(false)}
      >
        <div style={{ padding: "20px" }}>
          <p>Please Select Option</p>
          <div className="flex align-items-center mb-2">
            <Checkbox
              inputId="pollOption"
              value="PollIntranet"
              onChange={(e: any) => setPollSelected(e.checked)}
              checked={pollSelected}
            />
            <label htmlFor="pollOption" className="ml-2">
              Poll
            </label>
          </div>
          <div className="flex justify-content-end mt-3">
            <button
              className="p-button p-button-primary"
              onClick={handleConfirm}
            >
              Apply
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );

  // const [ispopup, setIspopup] = useState<boolean>(false);
  // return (
  //   <>
  //     <div style={{ display: "flex", justifyContent: "flex-end" }}>
  //       <i
  //         onClick={() => {
  //           setIspopup(true);
  //         }}
  //         className="pi pi-pencil"
  //         style={{ fontSize: "1rem", color: "blue" }}
  //       ></i>
  //     </div>
  //     <div
  //       className={styles.container}
  //       // style={{
  //       //   display: "flex",
  //       //   margin: "20px",
  //       //   gap: "15px",
  //       // }}
  //     >
  //       <div>
  //         <QuestionCeo props={props} />
  //       </div>
  //       <div>
  //         <PollIntranet props={props} />
  //       </div>
  //       <div>
  //         <Shoutout props={props} />
  //       </div>

  //       <Dialog
  //         header="Select option"
  //         visible={ispopup}
  //         // closable={true}
  //         showHeader={false}
  //         style={{ width: "35vw" }}
  //         onHide={() => {
  //           if (!ispopup) return;
  //           setIspopup(false);
  //         }}
  //       >
  //         <div style={{ padding: "20px" }}>
  //           <p>Please Select Option</p>
  //           <div className="flex align-items-center">
  //             <Checkbox
  //               inputId="ingredient1"
  //               name="pizza"
  //               value="Cheese"
  //               checked
  //               // onChange={onIngredientsChange}
  //               // checked={ingredients.includes("Cheese")}
  //             />
  //             <label htmlFor="ingredient1" className="ml-2">
  //               Poll
  //             </label>
  //           </div>
  //         </div>
  //       </Dialog>
  //     </div>
  //   </>

  //   // <div
  //   //   style={{
  //   //     display: "flex",
  //   //     justifyContent: "space-between",
  //   //     alignItems: "center",
  //   //   }}
  //   // >
  //   //   <QuestionCeo props={props} />
  //   //   <PollIntranet props={props} />
  //   //   <Shoutout props={props} />
  //   // </div>
  // );
};
export default FlexipleSectionIntranet;
