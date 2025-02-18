import { genImage, deleteImage } from "#puppeteer";
import fetch from "node-fetch";
import fs from "fs";
import log from "#logger";

export default async (client) => {
  return {
    handler: async (event) => {
      try {
        const message = event.message;
        const text = message.message;

        if (text.startsWith("/kfc")) {
          try {
            const response = await fetch("https://api.52vmy.cn/api/wl/yan/kfc");
            const data = await response.json();
            let htmlContent = fs.readFileSync(
              "plugins/MLeaf-plugins/kfc/html/kfc.html",
              "utf-8"
            );
            htmlContent = htmlContent.replace("${content}", data.content);
            const viewport = { width: 542, height: 200 };
            const screenshotPath = await genImage(htmlContent, viewport);
            await client.sendMessage(message.chatId, {
              file: screenshotPath,
            });
            await deleteImage(screenshotPath);
          } catch (error) {
            console.error("请求不到啊啊啊:", error);
            await client.sendMessage(message.chatId, {
              message: "接口请求不到，你的kfc吃不到了",
            });
          }
        }
      } catch (error) {
        log.error(`插件处理消息时出错: ${error}`);
      }
    },
  };
};
