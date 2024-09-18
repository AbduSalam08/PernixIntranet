import { Avatar } from "primereact/avatar";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import styles from "./QuestionsCeoIntranet.module.scss";
import { Carousel } from "primereact/carousel";
const QuestionsCeoIntranet = (): JSX.Element => {
  interface IQuestion {
    title: string;
    content: string;
    date: string;
    avatarUrl: string;
    replies: IReply[];
  }

  interface IReply {
    content: string;
    date: string;
    avatarUrl: string;
  }

  const questions: IQuestion[] = [
    {
      title: "The future of analytics and business intelligence",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      date: "23/08/2024",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      replies: [
        {
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
          date: "26/08/2024",
          avatarUrl: "https://randomuser.me/api/portraits/men/34.jpg",
        },
      ],
    },

    {
      title: "The future of analytics and business intelligence",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      date: "23/08/2024",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      replies: [
        {
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
          date: "26/08/2024",
          avatarUrl: "https://randomuser.me/api/portraits/men/34.jpg",
        },
      ],
    },

    {
      title: "The future of analytics and business intelligence",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      date: "23/08/2024",
      avatarUrl: "Venkat@mydomain28.onmicrosoft.com",
      replies: [
        {
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit",
          date: "26/08/2024",
          avatarUrl: "Venkat@mydomain28.onmicrosoft.com",
        },
      ],
    },
    // Add more questions here
  ];

  const productTemplate = (val: any) => {
    return (
      <div>
        <div className={styles.questions}>
          <div className={styles.imgsection}>
            <Avatar
              className="qustionceo"
              image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.avatarUrl}`}
              // size="small"
              shape="circle"
              style={{
                width: "40px !important",
                height: "40px !important",
              }}
              // data-pr-tooltip={val.receiverName}
            />
          </div>
          <p className={styles.ques}>{val.title}</p>
        </div>
        <p className={styles.date}>
          <i className="pi pi-clock" style={{ fontSize: "1rem" }}></i>
          {val.date}
        </p>

        <div>
          <div className={styles.questions}>
            <div className={styles.imgsection}>
              <Avatar
                className="qustionceo"
                image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.replies[0]?.avatarUrl}`}
                shape="circle"

                // data-pr-tooltip={val.receiverName}
              />
            </div>
            <p className={styles.answer}>{val.replies[0]?.content}</p>
          </div>
          <p className={styles.date}>
            <i className="pi pi-clock" style={{ fontSize: "1rem" }}></i>
            {val.replies[0]?.date}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.quesToCEOContainer}>
      <SectionHeaderIntranet label={"Question to the CEO"} />

      <div className={styles.contentSexction}>
        <Carousel
          value={questions}
          numScroll={1}
          numVisible={1}
          showIndicators={true}
          showNavigators={false}
          circular
          autoplayInterval={questions.length > 1 ? 3000 : 8.64e7}
          // responsiveOptions={responsiveOptions}
          itemTemplate={productTemplate}
        />
      </div>
    </div>
  );
};

export default QuestionsCeoIntranet;
