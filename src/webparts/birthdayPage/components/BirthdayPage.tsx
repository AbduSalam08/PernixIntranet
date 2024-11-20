/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import { useEffect, useState } from "react";
import styles from "./BirthdayPage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import {
  getAllBirthdayData,
  getBirthdayCurrentUserRole,
} from "../../../services/BirthDayIntranet/birthDayIntranet";

const BirthdayPage = (props: any): JSX.Element => {
  const dispatch = useDispatch();
  const birthDaysData: any = useSelector((state: any) => {
    return state.BirthdaysData.value;
  });
  console.log("birthDaysData", birthDaysData);
  const [currentUserDetails, setCurrentUserDetails] = useState<any>({
    role: "User",
    email: "",
  });
  console.log("currentUserDetails", currentUserDetails);

  useEffect(() => {
    dispatch(setMainSPContext(props?.context));
    getBirthdayCurrentUserRole(setCurrentUserDetails);
    getAllBirthdayData(dispatch);
  }, [dispatch]);
  return <div className={styles.heading}>BirthdayPage</div>;
};
export default BirthdayPage;
