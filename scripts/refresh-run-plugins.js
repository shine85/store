"use strict";

// 用 CloudRunFilesBuilder 每日构建同步 .run：已有的覆盖，没有的新增。
// 跳过 25 前缀和 aarch32，避免混进 25.12 线或 32 位包。

const fs = require("fs");
const path = require("path");

const DEFAULT_REPO = "wkccd/CloudRunFilesBuilder";
const USER_AGENT = "shine85-store-refresh-run-plugins";
const FAMILY_ALIASES = {
  "luci-app-homeproxy": "homeproxy",
  ssrp: "ssrp-mihomo",
};
const ARM64_FLAVOR_RANK = {
  "cortex-a53": 4,
  a53: 3,
  aarch64: 2,
  generic: 1,
};

function parseRunName(filename) {
  const base = String(filename).replace(/\.run$/i, "");
  const prefixMatch = base.match(/^(24|25)[_-]/i);
  const prefix = prefixMatch ? prefixMatch[1] : "";
  const rest = prefixMatch ? base.slice(prefixMatch[0].length) : base;

  let archClass = "all";
  let archFlavor = "all";
  const has = (token) => new RegExp(`(?:^|[_-])${token}(?:[_-]|$)`, "i").test(rest);
  if (has("aarch32") || has("armv7")) {
    archClass = "arm32";
    archFlavor = "arm32";
  } else if (has("x86[_-]?64") || has("x86-64")) {
    archClass = "x86";
    archFlavor = "x86_64";
  } else if (has("aarch64_cortex-a53")) {
    archClass = "arm64";
    archFlavor = "cortex-a53";
  } else if (has("aarch64_generic")) {
    archClass = "arm64";
    archFlavor = "generic";
  } else if (has("aarch64_a53") || has("a53")) {
    archClass = "arm64";
    archFlavor = "a53";
  } else if (has("aarch64") || has("arm64")) {
    archClass = "arm64";
    archFlavor = "aarch64";
  } else if (has("x86")) {
    archClass = "x86";
    archFlavor = "x86";
  } else if (has("all")) {
    archClass = "all";
    archFlavor = "all";
  }

  return {
    prefix,
    family: normalizeFamily(rest),
    archClass,
    archFlavor,
    filename,
  };
}

function normalizeFamily(rest) {
  let s = String(rest).toLowerCase();
  s = s.replace(
    /x86[_-]?64|x86-64|aarch64_cortex-a53|aarch64_generic|aarch64_a53|aarch64|aarch32|arm64|armv7/gi,
    ""
  );
  s = s.replace(/(?:^|[_-])(?:x86|all)(?=[_-]|$)/gi, "-");
  s = s.replace(/(?:^|[_-])[0-9a-f]{7,40}(?=[_-]|$)/g, "-");
  s = s.replace(/v?\d+(?:\.\d+){1,}(?:[-_]r\d+)?/g, "");
  s = s.replace(/\d{4}\.\d{2}\.\d{2}/g, "");
  s = s.replace(/\d{2,3}[-_]r?\d+/g, "");
  s = s.replace(/(?:^|[_-])\d+(?=[_-]|$)/g, "-");
  s = s.replace(/[_-]+/g, "-").replace(/^-|-$/g, "");
  return FAMILY_ALIASES[s] || s;
}

function pickRemoteAsset(local, assets) {
  const parsedLocal = typeof local === "string" ? parseRunName(local) : local;
  const candidates = assets
    .map((name) => parseRunName(name))
    .filter((item) => item.family === parsedLocal.family)
    .filter((item) => item.prefix === parsedLocal.prefix)
    .filter((item) => item.archClass === parsedLocal.archClass);

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => {
    const aSame = a.archFlavor === parsedLocal.archFlavor;
    const bSame = b.archFlavor === parsedLocal.archFlavor;
    if (aSame !== bSame) {
      return aSame ? -1 : 1;
    }
    const rankA = ARM64_FLAVOR_RANK[a.archFlavor] || 0;
    const rankB = ARM64_FLAVOR_RANK[b.archFlavor] || 0;
    if (rankA !== rankB) {
      return rankB - rankA;
    }
    return b.filename.localeCompare(a.filename, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
  return candidates[0].filename;
}

function targetDirs(archClass, filesByDir) {
  const keys = Object.keys(filesByDir);
  const arm = keys.find((key) => /arm64$/i.test(key)) || "run/arm64";
  const x86 = keys.find((key) => /x86$/i.test(key)) || "run/x86";
  if (archClass === "arm64") {
    return [arm];
  }
  if (archClass === "x86") {
    return [x86];
  }
  if (archClass === "all") {
    return [arm, x86];
  }
  return [];
}

function preferredPrefix(items) {
  if (items.some((item) => item.prefix === "")) {
    return "";
  }
  if (items.some((item) => item.prefix === "24")) {
    return "24";
  }
  return null;
}

function planRefresh({ filesByDir, assets, addMissing = true }) {
  const planMap = new Map();

  const addItem = (dir, to, fromName) => {
    const key = `${dir}\0${to}`;
    if (!planMap.has(key)) {
      planMap.set(key, { dir, to, from: [] });
    }
    const item = planMap.get(key);
    if (fromName && !item.from.includes(fromName)) {
      item.from.push(fromName);
    }
  };

  const present = new Set();
  for (const [dir, files] of Object.entries(filesByDir)) {
    for (const filename of files) {
      const parsed = parseRunName(filename);
      present.add(`${parsed.family}\0${dir}`);
      const remote = pickRemoteAsset(filename, assets);
      if (!remote || remote === filename) {
        continue;
      }
      addItem(dir, remote, filename);
    }
  }

  if (addMissing) {
    const grouped = new Map();
    for (const name of assets) {
      const parsed = parseRunName(name);
      if (parsed.archClass === "arm32" || parsed.prefix === "25") {
        continue;
      }
      const key = `${parsed.family}\0${parsed.archClass}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(parsed);
    }

    for (const items of grouped.values()) {
      const prefix = preferredPrefix(items);
      if (prefix === null) {
        continue;
      }
      const pool = items.filter((item) => item.prefix === prefix);
      const sample = pool[0];
      const preferredFlavor =
        sample.archClass === "arm64"
          ? "cortex-a53"
          : sample.archClass === "x86"
            ? "x86_64"
            : "all";
      const remote = pickRemoteAsset(
        {
          family: sample.family,
          prefix,
          archClass: sample.archClass,
          archFlavor: preferredFlavor,
        },
        pool.map((item) => item.filename)
      );
      if (!remote) {
        continue;
      }
      for (const dir of targetDirs(sample.archClass, filesByDir)) {
        if (present.has(`${sample.family}\0${dir}`)) {
          continue;
        }
        const existing = filesByDir[dir] || [];
        if (existing.includes(remote)) {
          continue;
        }
        addItem(dir, remote, null);
        present.add(`${sample.family}\0${dir}`);
      }
    }
  }

  return [...planMap.values()].sort(
    (a, b) => a.dir.localeCompare(b.dir) || a.to.localeCompare(b.to)
  );
}

function parseArgs(argv) {
  const opts = {
    apply: false,
    repo: DEFAULT_REPO,
    runDir: "run",
    summaryFile: "",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") {
      opts.apply = true;
    } else if (arg === "--repo") {
      opts.repo = argv[(i += 1)];
    } else if (arg === "--run-dir") {
      opts.runDir = argv[(i += 1)];
    } else if (arg === "--summary-file") {
      opts.summaryFile = argv[(i += 1)];
    } else if (arg === "--help") {
      opts.help = true;
    } else {
      throw new Error(`未知参数: ${arg}`);
    }
  }
  return opts;
}

function listRunFiles(runDir) {
  const filesByDir = {};
  for (const arch of ["arm64", "x86"]) {
    const dir = path.join(runDir, arch);
    const key = `${String(runDir).replace(/\\/g, "/")}/${arch}`;
    if (!fs.existsSync(dir)) {
      continue;
    }
    filesByDir[key] = fs
      .readdirSync(dir)
      .filter((name) => name.toLowerCase().endsWith(".run"));
  }
  return filesByDir;
}

function authHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchLatestRelease(repo, token) {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error(`读取 ${repo} latest release 失败: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function downloadAsset(url, dest, token) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`下载失败 ${url}: ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const tmp = `${dest}.part`;
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, dest);
}

function formatSummary(release, plan, applied) {
  const lines = [
    `## CloudRunFilesBuilder 插件刷新`,
    "",
    `- release: \`${release.tag_name || "unknown"}\``,
    `- 模式: ${applied ? "apply" : "dry-run"}`,
    `- 变更数: ${plan.length}`,
    "",
  ];
  if (plan.length === 0) {
    lines.push("现有 `.run` 已是该 release 中可同步的最新文件。");
    return lines.join("\n");
  }
  lines.push("| 目录 | 旧文件 | 新文件 |");
  lines.push("| --- | --- | --- |");
  for (const item of plan) {
    const from = item.from.length
      ? item.from.map((name) => `\`${name}\``).join("<br>")
      : "（新增）";
    lines.push(`| \`${item.dir}\` | ${from} | \`${item.to}\` |`);
  }
  return lines.join("\n");
}

function writeGithubOutput(values) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) {
    return;
  }
  const text = Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  fs.appendFileSync(outputFile, `${text}\n`);
}

async function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  if (opts.help) {
    console.log(
      "Usage: node scripts/refresh-run-plugins.js [--apply] [--repo wkccd/CloudRunFilesBuilder] [--run-dir run]"
    );
    return;
  }
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  const release = await fetchLatestRelease(opts.repo, token);
  const assets = (release.assets || [])
    .map((asset) => asset.name)
    .filter((name) => String(name).toLowerCase().endsWith(".run"));
  const filesByDir = listRunFiles(opts.runDir);
  const plan = planRefresh({ filesByDir, assets });
  const summary = formatSummary(release, plan, opts.apply);
  console.log(summary);
  if (opts.summaryFile) {
    fs.appendFileSync(opts.summaryFile, `${summary}\n`);
  }
  writeGithubOutput({
    release_tag: release.tag_name || "",
    changed: plan.length > 0 ? "true" : "false",
  });

  if (!opts.apply || plan.length === 0) {
    return;
  }

  const assetByName = new Map((release.assets || []).map((asset) => [asset.name, asset]));
  for (const item of plan) {
    const dest = path.join(item.dir, item.to);
    if (!fs.existsSync(dest)) {
      const asset = assetByName.get(item.to);
      if (!asset || !asset.browser_download_url) {
        throw new Error(`release 中找不到资源: ${item.to}`);
      }
      console.log(`下载 ${item.to} -> ${dest}`);
      await downloadAsset(asset.browser_download_url, dest, token);
    }
    for (const from of item.from) {
      if (from === item.to) {
        continue;
      }
      const oldPath = path.join(item.dir, from);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log(`删除旧文件 ${oldPath}`);
      }
    }
  }
}

module.exports = {
  parseRunName,
  pickRemoteAsset,
  planRefresh,
  listRunFiles,
  formatSummary,
  main,
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err.stack || err.message || err);
    process.exitCode = 1;
  });
}