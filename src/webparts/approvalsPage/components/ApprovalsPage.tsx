/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-use-before-define */
/* eslint-disable  @typescript-eslint/explicit-function-return-type */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import styles from "./ApprovalsPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import { IPageURL } from "../../../interface/interface";
import { CONFIG } from "../../../config/config";
import { sp } from "@pnp/sp/presets/all";

/* Interfaces creation */
interface Count {
  Blog: number | any;
  QCeo: number | any;
  News: number | any;
}

/* Global variable creation */
const errorImg: string = require("../../../assets/images/svg/errorImg.svg");
const arrLinksData: IPageURL[] = [
  {
    Name: CONFIG.CommonentsName.Birthdays,
    GroupName: CONFIG.SPGroupName.Birthdays_Admin,
    URL: CONFIG.NavigatePage.BirthdayPage + "?Page=activity",
    Image: require("../assets/Birthday.png"),
    IsAdmin: false,
  },
  {
    Name: CONFIG.CommonentsName.Blogs,
    GroupName: CONFIG.SPGroupName.Blogs_Admin,
    URL: CONFIG.NavigatePage.BlogsPage + "?Page=activity",
    Image: require("../assets/Blogs.png"),
    IsAdmin: false,
  },
  {
    Name: CONFIG.CommonentsName.Calendar,
    GroupName: CONFIG.SPGroupName.Calendar_Admin,
    URL: CONFIG.NavigatePage.CalendarPage + "?Page=activity",
    Image: require("../assets/Calendar.png"),
    IsAdmin: false,
  },
  {
    Name: CONFIG.CommonentsName.DocumentRepository,
    GroupName: CONFIG.SPGroupName.Documentrepository_Admin,
    URL: CONFIG.NavigatePage.DocRepositoryPage + "?Page=activity",
    Image: require("../assets/Document.png"),
    IsAdmin: false,
  },
  {
    Name: CONFIG.CommonentsName.Feedback,
    GroupName: CONFIG.SPGroupName.Feedback_Admin,
    URL: CONFIG.NavigatePage.FeedbackPage + "?Page=activity",
    Image: require("../assets/Feedback.png"),
    IsAdmin: false,
  },
  {
    Name: CONFIG.CommonentsName.MotivationBanner,
    GroupName: CONFIG.SPGroupName.Mainbanner_Admin,
    URL: CONFIG.NavigatePage.MotivationPage + "?Page=activity",
    Image: require("../assets/Motivation.png"),
    IsAdmin: false,
  },
  {
    Name: CONFIG.CommonentsName.NewHires,
    GroupName: CONFIG.SPGroupName.Newhire_Admin,
    URL: CONFIG.NavigatePage.NewHiresPage + "?Page=activity",
    Image: require("../assets/NewHires.png"),
    IsAdmin: false,
  },
  {
    Name: CONFIG.CommonentsName.News,
    GroupName: CONFIG.SPGroupName.News_Admin,
    URL: CONFIG.NavigatePage.NewsPage + "?Page=activity",
    Image: require("../assets/News.png"),
    IsAdmin: false,
  },
  {
    Name: CONFIG.CommonentsName.Poll,
    GroupName: CONFIG.SPGroupName.Poll_Admin,
    URL: CONFIG.NavigatePage.PollPage + "?Page=activity",
    Image: require("../assets/Poll.png"),
    IsAdmin: false,
  },
  {
    Name: CONFIG.CommonentsName.QuestionCEO,
    GroupName: CONFIG.SPGroupName.QuestionCEO_Admin,
    URL: CONFIG.NavigatePage.QuestionsCEOPage + "?Page=activity",
    Image: require("../assets/Questions.png"),
    IsAdmin: false,
  },
  {
    Name: CONFIG.CommonentsName.ShoutOuts,
    GroupName: CONFIG.SPGroupName.Shoutouts_Admin,
    URL: CONFIG.NavigatePage.ShoutOutsPage + "?Page=activity",
    Image: require("../assets/ShoutOuts.png"),
    IsAdmin: false,
  },
];

const ApprovalsPage = (props: any): JSX.Element => {
  /* State creation */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [arrMasterData, setArrMasterData] = useState<IPageURL[]>([]);
  const [count, setCount] = useState<Count>({
    Blog: 0,
    QCeo: 0,
    News: 0,
  });

  /* Functions creation */
  const adminAccessCheck = async (
    groupName: string,
    userId: number
  ): Promise<boolean> => {
    const groupAdminUsers: any = await sp.web.siteGroups
      .getByName(groupName)
      .users.get();

    const isGroupAdmin: boolean =
      groupAdminUsers?.some((item: any) => item?.Id === userId) || false;

    return isGroupAdmin;
  };

  const getSPGroupUsers = async (userId: number): Promise<void> => {
    const updatedLinksData: IPageURL[] = await Promise.all(
      arrLinksData?.map(async (val: IPageURL) => {
        const isAdmin: boolean = await adminAccessCheck(val?.GroupName, userId);

        return { ...val, IsAdmin: isAdmin };
      }) || []
    );

    const arrAdminData: IPageURL[] =
      updatedLinksData?.filter((val: IPageURL) => val?.IsAdmin) || [];

    setArrMasterData(arrAdminData);
    setIsLoading(false);
  };

  const getSuperAdminFun = async (userId: number): Promise<void> => {
    const superAdminUsers: any = await sp.web.siteGroups
      .getByName(CONFIG.SPGroupName.Pernix_Admin)
      .users.get();

    const isSuperAdmin: boolean =
      superAdminUsers?.some((item: any) => item?.Id === userId) || false;

    if (isSuperAdmin) {
      const updatedLinksData: IPageURL[] = await Promise.all(
        arrLinksData?.map(async (val: IPageURL) => {
          return { ...val, IsAdmin: true };
        }) || []
      );

      const arrAdminData: IPageURL[] =
        updatedLinksData?.filter((val: IPageURL) => val?.IsAdmin) || [];

      setArrMasterData(arrAdminData);
      setIsLoading(false);
    } else {
      await getSPGroupUsers(userId);
    }
  };

  const getCurrentUser = async (): Promise<void> => {
    const currentUser: any = await sp.web.currentUser.get();
    await getSuperAdminFun(currentUser?.Id ?? null);

    const blog = await fetchListData({
      listName: CONFIG.ListNames.Intranet_Blogs,
      filters: "Status eq 'Pending'",
    });

    const Questionceo = await fetchListData({
      listName: CONFIG.ListNames.Intranet_QuestionsToCEO,
      select: "*,AssignTo/ID,AssignTo/EMail",
      expand: "AssignTo",
      filters: "AssignToId eq null ",
    });

    const NewsCount = await fetchListData({
      listName: CONFIG.ListNames.Intranet_News,
      filters: "Status eq 'Pending' ",
    });

    setCount({
      Blog: blog,
      QCeo: Questionceo,
      News: NewsCount,
    });
  };

  const onLoadingFUN = async (): Promise<void> => {
    setIsLoading(true);
    getCurrentUser();
  };
  // const fetchListdata = async (): Promise<void> => {
  //   const res: any[] = await SpServices.SPReadItems({
  //     Listname: CONFIG.ListNames.Intranet_Blogs,
  //     Select: "*, AttachmentFiles, Author/ID, Author/Title, Author/EMail",
  //     Expand: "AttachmentFiles, Author",
  //     Filter: [
  //       {
  //         FilterKey: "Status",
  //         Operator: "eq",
  //         FilterValue: "Pending",
  //       },
  //     ],
  //     Topcount: 5000,
  //     Orderby: "Created",
  //     Orderbydecorasc: false,
  //   });
  //   console.log(res,"res");

  // };

  // const fetchListData = async ({
  //   listName,
  //   filters ,
  //   topCount = 5000,
  //   orderBy = "Created",
  //   orderByAsc = false,
  //   select,
  //   expand
  // }: {
  //   listName: string;
  //   filters?: { FilterKey: string; Operator: string; FilterValue: string }[];
  //   topCount?: number;
  //   orderBy?: string;
  //   orderByAsc?: boolean;
  //   select?:any,
  //   expand?:any,
  // }): Promise<any> => {
  //   const res: any[] = await SpServices.SPReadItems({
  //     Listname: listName,
  //     Select: select,
  //     Expand: expand,
  //     Filter: filters,
  //     Topcount: topCount,
  //     Orderby: orderBy,
  //     Orderbydecorasc: orderByAsc,
  //   });
  //   debugger
  //   return res.length;
  // };

  const fetchListData = async ({
    listName,
    filters = "",
    topCount = 5000,
    orderBy = "Created",
    orderByAsc = false,
    select = "*",
    expand = "",
  }: {
    listName: string;
    filters?: string;
    topCount?: number;
    orderBy?: string;
    orderByAsc?: boolean;
    select?: string;
    expand?: string;
  }) => {
    try {
      const items = await sp.web.lists
        .getByTitle(listName)
        .items.filter(filters)
        .select(select)
        .expand(expand)
        .top(topCount)
        .orderBy(orderBy, orderByAsc)
        .get();

      return items && items.length;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  };

  useEffect(() => {
    onLoadingFUN();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <>
          {/* Header section */}
          <div className={styles.headerContainer}>
            <div className={styles.backContainer}>
              <div
                style={{
                  cursor: "pointer",
                }}
                onClick={(_) => {
                  window.open(
                    props.context.pageContext.web.absoluteUrl +
                      CONFIG.NavigatePage.PernixIntranet,
                    "_self"
                  );
                }}
              >
                <i
                  className="pi pi-arrow-circle-left"
                  style={{
                    fontSize: "26px",
                    color: "#e0803d",
                  }}
                />
              </div>
              <div className={styles.backHeader}>My activities</div>
            </div>
          </div>

          {/* Body section */}
          {arrMasterData?.length ? (
            <div className={styles.bodyContainer}>
              <div className={styles.activitieContainer}>
                {arrMasterData?.map((val: IPageURL, idx: number) => {
                  return (
                    <div
                      key={idx}
                      title={val?.Name}
                      className={styles.activitieCard}
                      onClick={() => {
                        window.open(
                          props.context.pageContext.web.absoluteUrl + val?.URL,
                          "_self"
                        );
                      }}
                    >
                      <div className={styles.imgSec}>
                        <img src={val?.Image} alt={val?.Name} />
                      </div>
                      <div className={styles.nameSec}>{val?.Name}</div>

                      <div>
                        {/* Conditional rendering of the badge */}
                        {val.Name === CONFIG.CommonentsName.Blogs &&
                        count.Blog > 0 ? (
                          <div className={styles.customBadge}>
                            {count?.Blog > 99 ? count.Blog + "+" : count.Blog}
                          </div>
                        ) : null}

                        {val.Name === CONFIG.CommonentsName.QuestionCEO &&
                        count.QCeo > 0 ? (
                          <div className={styles.customBadge}>
                            {count?.QCeo > 99 ? count.QCeo + "+" : count.QCeo}
                          </div>
                        ) : null}

                        {val.Name === CONFIG.CommonentsName.News &&
                        count.News > 0 ? (
                          <div className={styles.customBadge}>
                            {count?.News > 99 ? count?.News + "+" : count?.News}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={styles.content}>
              <img src={errorImg} alt="errorImg" />
              <div>You don't have access to this page!</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApprovalsPage;
