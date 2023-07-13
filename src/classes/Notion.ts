import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { BlockObject } from "../@types";

dotenv.config();

export class NotionTextFetcher {
  notion: Client;

  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });
  }
  async fetchChildBlocks(
    notionPageId: string,
    depth: number = 0
  ): Promise<BlockObject[]> {
    const blocks: BlockObject[] = [];
    let cursor: string | null = null;
    do {
      const { results, next_cursor, has_more } =
        await this.notion.blocks.children.list({
          block_id: notionPageId,
        });
      for (const block of results) {
        if ("type" in block) {
          if (block.has_children) {
            const children = await this.fetchChildBlocks(block.id, depth + 1);
            blocks.push({ ...block, depth, children });
          } else {
            blocks.push({ ...block, depth });
          }
        }
      }
      cursor = has_more ? next_cursor : null;
    } while (cursor !== null);

    return blocks;
  }
  async fetchText(blocks: BlockObject[]) {
    blocks.forEach(async (block) => {
      switch (block.type) {
        case "heading_1":
          block.heading_1.rich_text.forEach((text) => {
            console.log(text.plain_text);
          });
          break;
        case "heading_2":
          block.heading_2.rich_text.forEach((text) => {
            console.log(text.plain_text);
          });
          break;
        case "heading_3":
          block.heading_3.rich_text.forEach((text) => {
            console.log(text.plain_text);
          });
          break;
        case "numbered_list_item":
          block.numbered_list_item.rich_text.forEach((text) => {
            console.log(text.plain_text);
          });
          break;
        case "callout":
          block.callout.rich_text.forEach((text) => {
            console.log(text.plain_text);
          });
          break;
        case "paragraph":
          block.paragraph.rich_text.forEach((text) =>
            console.log(text.plain_text)
          );
          break;
        case "toggle":
          block.toggle.rich_text.forEach((text) => {
            console.log(text.plain_text);
          });
          break;
        case "bulleted_list_item":
          block.bulleted_list_item.rich_text.forEach((text) => {
            console.log(text.plain_text);
          });
          break;
        case "child_database":
          const databaseItems = await this.notion.databases.query({
            database_id: block.id,
          });
          console.log(JSON.stringify(databaseItems.results, null, 2));
          break;
        case "image":
          break;
        default:
          console.log(block);
      }
      if (block.children) {
        this.fetchText(block.children);
      }
    });
  }
  async parseDatabaseItem(databaseId: string) {
    const databaseItems = await this.notion.databases.query({
      database_id: databaseId,
    });
    const parsedDatabaseItems = databaseItems.results.map((item) => {
      if ("properties" in item) {
        const properties = Object.entries(item.properties).map(
          ([key, value]) => {
            switch (value.type) {
              case "title":
                return [key, value.title[0].plain_text];
              case "multi_select":
                return [key, value.multi_select.map((option) => option.name)];
              default:
                return;
            }
          }
        );
        return properties;
      }
    });
  }
  async fetch(notionPageId: string) {
    const blocks = await this.fetchChildBlocks(notionPageId);
    await this.fetchText(blocks);
  }
}
