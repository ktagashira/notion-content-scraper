import dotenv from "dotenv";
import { NotionTextFetcher } from "../classes/Notion";

dotenv.config();

async function main() {
  if (!process.env.NOTION_PAGE_ID) {
    throw new Error("No database id provided");
  }
  const fetcher = new NotionTextFetcher();
  console.log("Fetching blocks...");
  await fetcher.fetch(process.env.NOTION_PAGE_ID);
}

main();
