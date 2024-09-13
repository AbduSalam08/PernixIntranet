/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import NewsCard from "./NewsCard/NewsCard";
import styles from "./NewsIntranet.module.scss";
const PernixBannerImage = require("../../../assets/images/svg/PernixBannerImage.svg");

const NewsIntranet = (): JSX.Element => {
  const newsItems = [
    {
      imageUrl: PernixBannerImage, // Replace with your image URL
      title:
        "Beyond Dashboard: The Future of Analytics and Business Intelligence",
      description:
        "Explore the next generation of analytics tools that go beyond traditional dashboards to provide deeper insights and predictive capabilities.",
      status: "Active",
    },
    {
      imageUrl: PernixBannerImage, // Replace with your image URL
      title: "The Rise of AI: Transforming the Business Landscape",
      description:
        "Artificial Intelligence is no longer just a buzzword; it's reshaping industries and driving new business models.",
      status: "Upcoming",
    },
    {
      imageUrl: PernixBannerImage, // Replace with your image URL
      title: "Data Privacy in the Digital Age: Challenges and Solutions",
      description:
        "As data breaches become more common, understanding how to protect personal and business data is critical for success.",
      status: "Archived",
    },
  ];

  return (
    <div className={styles.newsContainer}>
      {newsItems?.map((item: any, idx: number) => {
        return (
          <NewsCard
            title={item?.title}
            imageUrl={item.imageUrl}
            key={idx}
            description={item?.description}
            noActions={true}
            noStatus={true}
          />
        );
      })}
    </div>
  );
};

export default NewsIntranet;
