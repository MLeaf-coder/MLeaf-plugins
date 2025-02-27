import fs from "fs";
import { genImage, deleteImage } from "#puppeteer";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getEpicFreeGames() {
  try {
    const response = await axios.get(
      "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN"
    );
    const data = response.data;
    // 过滤符合条件的元素：price不为"0"且startDate为空，或存在startDate但discountPercentage不为0
    const filteredElements = data.data.Catalog.searchStore.elements.filter(
      (element) => {
        const cond1 =
          element.price?.totalPrice?.fmtPrice.discountPrice !== "0" &&
          !element.promotions?.upcomingPromotionalOffers?.[0]
            ?.promotionalOffers?.[0]?.startDate;
        const cond2 =
          element.promotions?.upcomingPromotionalOffers?.[0]
            ?.promotionalOffers?.[0]?.startDate &&
          element.promotions?.upcomingPromotionalOffers?.[0]
            ?.promotionalOffers?.[0]?.discountSetting?.discountPercentage !== 0;
        return !(cond1 || cond2);
      }
    );
    const freefinfo = filteredElements.map((element) => ({
      title: element.title,
      description: element.description,
      himage: element.keyImages.find((image) => image.type === "Thumbnail").url,
      wimage: element.keyImages.find((image) => image.type === "OfferImageWide")
        .url,
      startDate:
        element.promotions?.upcomingPromotionalOffers?.[0]
          ?.promotionalOffers?.[0]?.startDate ||
        element.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0]
          ?.startDate ||
        "",
      endDate:
        element.promotions?.upcomingPromotionalOffers?.[0]
          ?.promotionalOffers?.[0]?.endDate ||
        element.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0]
          ?.endDate ||
        "",
      free: element.price?.totalPrice?.fmtPrice.discountPrice === "0",
    }));
    return freefinfo;
  } catch (error) {
    console.error("获取Epic免费游戏信息失败:", error);
  }
}

export default async function (client, event) {
    try {
      const message = event.message;
      const tip = await client.sendMessage(message.chatId, {
        message: "正在获取Epic商店信息...",
        replyTo: message.id,
      });
      try {
        const result = await getEpicFreeGames();
        const convertedResult = result.map((game) => ({
          ...game,
          startDate: game.startDate
            ? new Date(
                new Date(game.startDate).getTime() + 8 * 60 * 60 * 1000
              ).toLocaleDateString("zh-CN")
            : "",
          endDate: game.endDate
            ? new Date(
                new Date(game.endDate).getTime() + 8 * 60 * 60 * 1000
              ).toLocaleDateString("zh-CN")
            : "",
        }));
        const freeGames = convertedResult.filter((g) => g.free);
        const nonFreeGames = convertedResult.filter((g) => !g.free);
        let htmlContent = fs.readFileSync(
          path.join(__dirname, "html", "epic.html"),
          "utf-8"
        );
        // 替换免费游戏区域（最多2个）
        for (let i = 0; i < 2; i++) {
          const idx = i + 1;
          if (freeGames[i]) {
            htmlContent = htmlContent.replace(
              new RegExp(`\\\${game${idx}}`, "g"),
              freeGames[i].title
            );
            htmlContent = htmlContent.replace(
              new RegExp(`\\\${stop${idx}}`, "g"),
              freeGames[i].endDate
            );
            // 统一替换占位符 ${Freenow} 为 "当前免费"
            htmlContent = htmlContent.replace(/\${Freenow}/g, "当前免费");
            htmlContent = htmlContent.replace(
              new RegExp(`\\\${imageUrl${idx}}`, "g"),
              freeGames[i].himage
            );
            htmlContent = htmlContent.replace(
              new RegExp(`\\\${game${idx}_show}`, "g"),
              ""
            ); // 显示状态为空（显示）
          } else {
            htmlContent = htmlContent.replace(
              new RegExp(`\\\${game${idx}}`, "g"),
              ""
            );
            htmlContent = htmlContent.replace(
              new RegExp(`\\\${stop${idx}}`, "g"),
              ""
            );
            htmlContent = htmlContent.replace(/\${Freenow}/g, "");
            htmlContent = htmlContent.replace(
              new RegExp(`\\\${imageUrl${idx}}`, "g"),
              ""
            );
            htmlContent = htmlContent.replace(
              new RegExp(`\\\${game${idx}_show}`, "g"),
              "hidden"
            ); // 隐藏
          }
        }
        // 替换非免费游戏区域（最多2个）
        // 第一区块：占位符 game3, start1, end1, Comingsoon, imageUrl3
        if (nonFreeGames[0]) {
          htmlContent = htmlContent.replace(
            new RegExp(`\\\${game3}`, "g"),
            nonFreeGames[0].title
          );
          htmlContent = htmlContent.replace(
            new RegExp(`\\\${start1}`, "g"),
            nonFreeGames[0].startDate
          );
          htmlContent = htmlContent.replace(
            new RegExp(`\\\${end1}`, "g"),
            nonFreeGames[0].endDate
          );
          htmlContent = htmlContent.replace(/\${Comingsoon}/g, "即将免费");
          htmlContent = htmlContent.replace(
            new RegExp(`\\\${imageUrl3}`, "g"),
            nonFreeGames[0].wimage
          );
          htmlContent = htmlContent.replace(/\${game3_show}/g, "");
        } else {
          htmlContent = htmlContent.replace(/\${game3}/g, "");
          htmlContent = htmlContent.replace(/\${start1}/g, "");
          htmlContent = htmlContent.replace(/\${end1}/g, "");
          htmlContent = htmlContent.replace(/\${Comingsoon}/g, "");
          htmlContent = htmlContent.replace(/\${imageUrl3}/g, "");
          htmlContent = htmlContent.replace(/\${game3_show}/g, "hidden");
        }
        // 第二区块：占位符 game4, start2, end2, Comingsoon, imageUrl4
        if (nonFreeGames[1]) {
          htmlContent = htmlContent.replace(
            new RegExp(`\\\${game4}`, "g"),
            nonFreeGames[1].title
          );
          htmlContent = htmlContent.replace(
            new RegExp(`\\\${start2}`, "g"),
            nonFreeGames[1].startDate
          );
          htmlContent = htmlContent.replace(
            new RegExp(`\\\${end2}`, "g"),
            nonFreeGames[1].endDate
          );
          htmlContent = htmlContent.replace(/\${Comingsoon}/g, "即将免费");
          htmlContent = htmlContent.replace(
            new RegExp(`\\\${imageUrl4}`, "g"),
            nonFreeGames[1].wimage
          );
          htmlContent = htmlContent.replace(/\${game4_show}/g, "");
        } else {
          htmlContent = htmlContent.replace(/\${game4}/g, "");
          htmlContent = htmlContent.replace(/\${start2}/g, "");
          htmlContent = htmlContent.replace(/\${end2}/g, "");
          htmlContent = htmlContent.replace(/\${Comingsoon}/g, "");
          htmlContent = htmlContent.replace(/\${imageUrl4}/g, "");
          htmlContent = htmlContent.replace(/\${game4_show}/g, "hidden");
        }
        // 生成截图并发送图片消息
        const viewport = { width: 1300, height: 800 };
        const screenshotPath = await genImage(htmlContent, viewport);
        await client.sendMessage(message.chatId, {
          file: screenshotPath,
          replyTo: message.id,
        });
        await deleteImage(screenshotPath);
      } finally {
        await client.deleteMessages(message.chatId, [tip.id], {
          revoke: true,
        });
      }
    } catch (error) {
      log.error("Epic游戏信息处理失败:", error);
      await client.sendMessage(message.chatId, {
        message: "获取Epic游戏信息失败，请稍后再试",
        replyTo: message.id,
      });
    }

}
