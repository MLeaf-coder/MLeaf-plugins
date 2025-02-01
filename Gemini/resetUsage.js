import fs from "fs";
import yaml from "js-yaml";

// 读取 `ai.yaml`
function loadConfig() {
  return yaml.load(
    fs.readFileSync("./plugins/MLeaf-plugins/Gemini/ai.yaml", "utf8")
  );
}

// 更新 `ai.yaml`
function saveConfig(config) {
  fs.writeFileSync(
    "./plugins/MLeaf-plugins/Gemini/ai.yaml",
    yaml.dump(config),
    "utf8"
  );
}

// 重置 Qwen 计数并切换模型
function resetUsage() {
  const config = loadConfig();
  config.usage = { Qwen: 0 };
  config.state.Qwen = true;
  config.state.Gemini = false;
  saveConfig(config);
  console.log("已重置 Qwen 计数，并启用 Qwen。");
}

// 定时任务：每天 0:00 (北京时间) 执行
const now = new Date();
const millisTillMidnight =
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;

setTimeout(() => {
  resetUsage();
  setInterval(resetUsage, 24 * 60 * 60 * 1000); // 每天执行
}, millisTillMidnight);
