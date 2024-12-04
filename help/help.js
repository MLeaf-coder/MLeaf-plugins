import { genImage, deleteImage } from "../../../core/api/puppeteer.js";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url"; // 将路径转换为 file://

const importNotes = async () => {
  const notes = {};
  const __dirname = path.dirname(new URL(import.meta.url).pathname); // 当前模块目录
  const normalizedDirname = path.resolve(
    __dirname.replace(/^\/([a-zA-Z]:)/, "$1") // Windows 特殊处理
  );
  const pluginsDir = path.join(normalizedDirname, "../../"); // 定位到 plugins 根目录

  // 检查目录是否存在
  if (!fs.existsSync(pluginsDir)) {
    console.error(`插件目录不存在: ${pluginsDir}`);
    return notes;
  }

  // 遍历 plugins 目录的子目录
  const pluginAuthors = fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory()) // 仅保留子目录
    .map((dirent) => dirent.name); // 提取目录名

  for (const authorDir of pluginAuthors) {
    const filePath = path.join(pluginsDir, authorDir, "index.js");
    if (fs.existsSync(filePath)) {
      try {
        // 转换为 file:// 格式
        const fileUrl = pathToFileURL(filePath).href;
        const module = await import(fileUrl); // 动态导入
        if (module.Notes) {
          Object.assign(notes, module.Notes); // 合并 Notes
        }
      } catch (error) {
        console.error(`导入插件 ${authorDir} 时出错:`, error);
      }
    } else {
      console.warn(`未找到插件入口文件: ${filePath}`);
    }
  }
  return notes;
};

export default async (client, event) => {
  try {
    const message = event.message;
    const command = message.message.split(" ")[0];
    const me = await client.getMe();
    const [cmd, username] = command.split("@");
    if (username && username.toLowerCase() !== me.username.toLowerCase()) {
      return;
    }
    if (message.message === "/help") {
      try {
        const Notes = await importNotes(); // 获取合并后的 Notes
        let commandsHtml = ""; // 用于存储命令的 HTML 内容
        for (const key in Notes) {
          const { usage, description } = Notes[key];
          commandsHtml += `
            <div class="command">
              <div class="ioc">
                <img
                  src="http://localhost:3000/resources/${key}.png"
                  alt="Avatar"
                  style="width: 100%; height: 100%; object-fit: cover"
                />
              </div>
              <div class="line">
                <div class="text">${usage}</div>
                <div class="Notes">${description}</div>
              </div>
            </div>
          `;
        }

        const htmlContent = fs.readFileSync(
          "plugins/MLeaf-plugins/help/html/help.html",
          "utf-8"
        );

        // 将生成的命令 HTML 插入到 htmlContent 中
        const finalHtmlContent = htmlContent.replace(
          "<!-- commands -->",
          commandsHtml
        );

        const viewport = { width: 1250, height: 600 };
        const screenshotPath = await genImage(finalHtmlContent, viewport);
        await client.sendMessage(message.chatId, {
          file: screenshotPath,
        });
        await deleteImage(screenshotPath);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  } catch (error) {
    console.error(`插件处理消息时出错: ${error}`);
  }
};
