/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @rushstack/no-new-null */
import dayjs from "dayjs";

// Define an interface for item data
interface QuoteItem {
  createdAt: string; // Assuming createdAt is a date string in 'DD/MM/YYYY' format
  // Other properties can be added as needed
  [key: string]: any; // Add other dynamic fields for flexibility
}

// Function to get the latest item based on the 'createdAt' date
export const getLastQuoteBasedOnDate = (
  items: QuoteItem[]
): QuoteItem | null => {
  if (!items || items.length === 0) {
    return null; // Early return if items are null or empty
  }

  // Find the most recent item based on createdAt date
  const latestQuoteData = items.reduce(
    (latest: QuoteItem, current: QuoteItem) => {
      const latestDate = dayjs(latest.Created, "DD/MM/YYYY");
      const currentDate = dayjs(current.Created, "DD/MM/YYYY");

      return currentDate.isAfter(latestDate) ? current : latest;
    }
  );

  return latestQuoteData; // Return the entire item with the latest Created date
};
