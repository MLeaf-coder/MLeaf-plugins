import { mkdir, unlink } from "fs/promises";
import { join } from "path";
import os from "os";
import { execSync } from "child_process";
import UserAgent from "user-agents";

let puppeteer;
if (os.platform() === "android") {
  puppeteer = await import("puppeteer-core");
} else {
  puppeteer = await import("puppeteer");
}

let executablePath;
if (os.platform() === "android") {
  try {
    executablePath = execSync("which chromium-browser").toString().trim();
    if (!executablePath) {
      throw new Error("chromium-browser not found in PATH");
    }
  } catch (error) {
    console.error(`Error getting chromium-browser path: ${error.message}`);
    throw error;
  }
}

class BrowserManager {
  static async createBrowser(options = {}) {
    const defaultOptions = {
      executablePath,
      headless: true,
      args: ["--no-sandbox"],
      ...options
    };

    return await puppeteer.launch(defaultOptions);
  }

  static async createIncognitoPage(browser, options = {}) {
    const context = await browser.createBrowserContext();
    await context.deleteCookie();
    const page = await context.newPage();

    // 设置反爬虫检测
    await page.evaluate(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
        configurable: true,
      });
      delete navigator.webdriver;
    });

    await page.evaluate(() => {
      Object.defineProperty(navigator, "platform", {
        get: () => "Win32",
      });
    });

    await page.evaluateOnNewDocument(() => {
      window.chrome = {
        runtime: {},
        loadTimes: function () {},
        csi: function () {},
        app: {},
      };
    });

    // 设置 User-Agent
    const ua = new UserAgent({
      deviceCategory: options.deviceCategory || "desktop",
      platform: options.platform || "Win32",
    }).toString();

    await page.setUserAgent(ua);

    return page;
  }

  static async createPage(browser, options = {}) {
    const page = await browser.newPage();
    
    const ua = new UserAgent({
      deviceCategory: options.deviceCategory || "desktop",
      platform: options.platform || "Win32",
    }).toString();

    await page.setUserAgent(ua);
    return page;
  }
}

const outputDir = "./caching/puppeteer";

/**
 * Ensures that a directory exists, creating it if necessary
 * @param {string} dir - Directory path to check/create
 * @returns {Promise<void>}
 */
const ensureDirectoryExists = async (dir) => {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    console.error(`Error ensuring directory exists: ${err.message}`);
  }
};

// 重试
const retryFunction = async (fn, retries = 3, delay = 1000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt >= retries) {
        throw new Error(`Failed after ${retries} attempts`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
/**
 * Generate webpage screenshot
 * @param {string} htmlContent - HTML content to render
 * @param {Object} viewport - Viewport configuration
 * @param {number} viewport.width - Viewport width, default 800
 * @param {number} viewport.height - Viewport height, default 600
 * @param {number} [viewport.deviceScaleFactor] - Device scale factor
 * @returns {Promise<string>} Generated image file path
 */
const genImage = async (
  htmlContent,
  viewport = { width: 800, height: 600 }
) => {
  let browser;

  const generateScreenshot = async () => {
    try {
      browser = await BrowserManager.createBrowser({
        args: ["--no-sandbox", "--enable-gpu"],
      });

      const page = await browser.newPage();
      await page.setViewport(viewport);

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      await ensureDirectoryExists(outputDir);

      const fileName = `screenshot-${Date.now()}.png`;
      const outputPath = join(outputDir, fileName);

      await page.screenshot({ path: outputPath });
      await page.close();

      return outputPath;
    } catch (error) {
      console.error(`Error generating screenshot: ${error}`);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  };

  return await retryFunction(generateScreenshot);
};

/**
 *
 * @param {string} filePath - file path
 */
const deleteImage = async (filePath) => {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`);
    throw error;
  }
};
/**
 * Fetches HTML content from a URL using a specified device type and headers
 * @param {string} url - URL to fetch content from
 * @param {string} devicey - Device type ('desktop' or 'mobile'), default 'desktop'
 * @returns {Promise<string>} HTML content of the page
 * @throws {Error} If fetching fails
 */
const gethtml = async (url, devicey = "desktop") => {
  let browser;
  try {
    browser = await BrowserManager.createBrowser({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    const page = await BrowserManager.createPage(browser);

    // 设置更长的超时时间和更宽松的等待策略
    await page.setDefaultNavigationTimeout(60000);
    await page.goto(url, {
      waitUntil: ["domcontentloaded", "networkidle2"],
      timeout: 60000,
    });

    // 等待页面加载完成
    await page.waitForSelector("body", { timeout: 60000 });
    const pageContent = await page.content();
    return pageContent;
  } catch (error) {
    console.error(`Error fetching HTML content: ${error.message}`);
    if (error.name === "TimeoutError") {
      throw new Error(`页面加载超时，请稍后重试。原因：${error.message}`);
    }
    throw new Error(`获取页面内容失败：${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export { genImage, deleteImage, gethtml, BrowserManager, puppeteer };