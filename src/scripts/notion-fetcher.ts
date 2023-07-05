import dotenv from "dotenv";
import { Client } from "@notionhq/client";

dotenv.config();

async function main() {
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });
  if (!process.env.NOTION_PAGE_ID) {
    throw new Error("No database id provided");
  }
  const response = await notion.blocks.children.list({
    block_id: process.env.NOTION_PAGE_ID,
    page_size: 50,
  });
  console.log(JSON.stringify(response, null, 2));
}

main();
