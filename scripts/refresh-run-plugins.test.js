const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseRunName,
  pickRemoteAsset,
  planRefresh,
} = require("./refresh-run-plugins.js");

const REMOTE_ASSETS = [
  "24_quickfile_1.0.16_aarch64_cortex-a53.run",
  "24_quickfile_1.0.16_aarch64_generic.run",
  "24_quickfile_1.0.16_x86_64.run",
  "25-argon-2.4.7_aarch64_cortex-a53.run",
  "25-argon-2.4.7_x86_64.run",
  "25-luci-app-store-0.2.1-r1_all.run",
  "25-mosdns_v5.3.4-r14_aarch64_cortex-a53.run",
  "25-mosdns_v5.3.4-r14_x86_64.run",
  "25-openclash-aarch64_cortex-a53-v0.47.156.run",
  "25-openclash-x86-64-v0.47.156.run",
  "25-SSRP-mihomo-aarch64_cortex-a53-196-r9.run",
  "25-SSRP-mihomo-x86_64-196-r9.run",
  "25_PassWall_26.9.16_aarch64_a53.run",
  "25_PassWall_26.9.16_x86_64.run",
  "25_quickfile_1.0.16_aarch64_a53.run",
  "25_quickfile_1.0.16_x86_64.run",
  "AdGuardHome_v0.107.79_aarch32.run",
  "AdGuardHome_v0.107.79_aarch64.run",
  "AdGuardHome_v0.107.79_x86_64.run",
  "argon-2.4.3-r20250722_x86_64.run",
  "clashoo_2026.09.19_aarch64_a53.run",
  "clashoo_2026.09.19_x86_64.run",
  "dufs-0.46.0-r1_aarch64_cortex-a53.run",
  "dufs-0.46.0-r1_x86_64.run",
  "homeproxy-aarch64_cortex-a53-26.187.07809-9bce398.run",
  "homeproxy-x86_64-26.187.07809-9bce398.run",
  "luci-app-store-0.2.1-r1_all.run",
  "luci-app-uninstall-v1.2.6.run",
  "momo_v1.2.1_aarch64_cortex-a53.run",
  "momo_v1.2.1_x86_64.run",
  "mosdns_v5.3.4-r14_aarch64_cortex-a53.run",
  "mosdns_v5.3.4-r14_x86_64.run",
  "nikki_v1.26.1_aarch64_cortex-a53.run",
  "nikki_v1.26.1_x86_64.run",
  "openclash-aarch64_cortex-a53-v0.47.156.run",
  "openclash-x86-64-v0.47.156.run",
  "passwall2_aarch64_a53_26.9.16-1.run",
  "passwall2_x86_64_26.9.16-1.run",
  "passwall_aarch64_a53_26.9.16-1.run",
  "passwall_x86_64_26.9.16-1.run",
  "ssrp_mihomo_aarch64_cortex-a53-196_r9.run",
  "ssrp_mihomo_x86_64-196_r9.run",
];

function familyOf(name) {
  return parseRunName(name).family;
}

test("parseRunName extracts family, prefix and arch", () => {
  assert.deepEqual(parseRunName("AdGuardHome_v0.107.69_aarch64.run"), {
    prefix: "",
    family: "adguardhome",
    archClass: "arm64",
    archFlavor: "aarch64",
    filename: "AdGuardHome_v0.107.69_aarch64.run",
  });
  assert.equal(familyOf("luci-app-store-0.1.30-1_all.run"), "luci-app-store");
  assert.equal(parseRunName("luci-app-store-0.1.30-1_all.run").archClass, "all");
  assert.equal(familyOf("luci-app-uninstall-v1.1.8.run"), "luci-app-uninstall");
  assert.equal(parseRunName("luci-app-uninstall-v1.1.8.run").archClass, "all");
  assert.equal(familyOf("momo_v1.0.5_aarch64_cortex-a53.run"), "momo");
  assert.equal(parseRunName("momo_v1.0.5_aarch64_cortex-a53.run").archFlavor, "cortex-a53");
  assert.equal(familyOf("nikki_v1.25.0_aarch64_cortex-a53.run"), "nikki");
  assert.equal(familyOf("passwall2_aarch64_a53_25.11.14-1.run"), "passwall2");
  assert.equal(familyOf("passwall_aarch64_a53_26.7.1-1.run"), "passwall");
  assert.equal(familyOf("ssrp_aarch64_cortex-a53-190-r117.run"), "ssrp-mihomo");
  assert.equal(familyOf("ssrp_mihomo_aarch64_cortex-a53-196_r2.run"), "ssrp-mihomo");
  assert.equal(familyOf("ssrp_x86_64-190-r117.run"), "ssrp-mihomo");
  assert.equal(familyOf("luci-app-homeproxy-25.197.30224-af6a147_aarch64_cortex-a53.run"), "homeproxy");
  assert.equal(familyOf("homeproxy-x86_64-26.126.28706-6ac4a03.run"), "homeproxy");
  assert.equal(parseRunName("24_quickfile_1.0.16_aarch64_generic.run").prefix, "24");
  assert.equal(familyOf("24_quickfile_1.0.16_aarch64_generic.run"), "quickfile");
  assert.equal(parseRunName("24_quickfile_1.0.16_aarch64_generic.run").archFlavor, "generic");
  assert.equal(parseRunName("25-luci-app-store-0.2.1-r1_all.run").prefix, "25");
  assert.equal(familyOf("clashoo_2026.09.19_aarch64_a53.run"), "clashoo");
  assert.equal(familyOf("24-luci-app-dead_1.28-aarch64_generic.run"), "luci-app-dead");
  assert.equal(familyOf("mosdns_v5.3.4-r1_aarch64_cortex-a53.run"), "mosdns");
  assert.equal(familyOf("openclash-x86-64-v0.47.156.run"), "openclash");
  assert.equal(parseRunName("AdGuardHome_v0.107.79_aarch32.run").archClass, "arm32");
  assert.equal(parseRunName("AdGuardHome_v0.107.79_x86_64.run").archClass, "x86");
});

test("pickRemoteAsset keeps 24/25 prefix class and arch", () => {
  assert.equal(
    pickRemoteAsset(parseRunName("AdGuardHome_v0.107.69_aarch64.run"), REMOTE_ASSETS),
    "AdGuardHome_v0.107.79_aarch64.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("AdGuardHome_v0.107.69_x86_64.run"), REMOTE_ASSETS),
    "AdGuardHome_v0.107.79_x86_64.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("luci-app-store-0.1.30-1_all.run"), REMOTE_ASSETS),
    "luci-app-store-0.2.1-r1_all.run"
  );
  assert.notEqual(
    pickRemoteAsset(parseRunName("luci-app-store-0.1.30-1_all.run"), REMOTE_ASSETS),
    "25-luci-app-store-0.2.1-r1_all.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("ssrp_aarch64_cortex-a53-190-r117.run"), REMOTE_ASSETS),
    "ssrp_mihomo_aarch64_cortex-a53-196_r9.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("ssrp_x86_64-190-r117.run"), REMOTE_ASSETS),
    "ssrp_mihomo_x86_64-196_r9.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("luci-app-homeproxy-25.197.30224-af6a147_aarch64_cortex-a53.run"), REMOTE_ASSETS),
    "homeproxy-aarch64_cortex-a53-26.187.07809-9bce398.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("24_quickfile_1.0.16_aarch64_generic.run"), REMOTE_ASSETS),
    "24_quickfile_1.0.16_aarch64_generic.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("nikki_v1.24.2_x86_64.run"), REMOTE_ASSETS),
    "nikki_v1.26.1_x86_64.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("passwall2_aarch64_a53_25.11.14-1.run"), REMOTE_ASSETS),
    "passwall2_aarch64_a53_26.9.16-1.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("passwall_x86_64_26.7.1-1.run"), REMOTE_ASSETS),
    "passwall_x86_64_26.9.16-1.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("24-luci-app-dead_1.28-aarch64_generic.run"), REMOTE_ASSETS),
    null
  );
  assert.equal(
    pickRemoteAsset(parseRunName("momo_v1.0.5_aarch64_cortex-a53.run"), REMOTE_ASSETS),
    "momo_v1.2.1_aarch64_cortex-a53.run"
  );
  assert.notEqual(
    pickRemoteAsset(parseRunName("mosdns_v5.3.4-r1_x86_64.run"), REMOTE_ASSETS),
    "25-mosdns_v5.3.4-r14_x86_64.run"
  );
  assert.equal(
    pickRemoteAsset(parseRunName("mosdns_v5.3.4-r1_x86_64.run"), REMOTE_ASSETS),
    "mosdns_v5.3.4-r14_x86_64.run"
  );
});

test("planRefresh replaces old run files and collapses aliases", () => {
  const plan = planRefresh({
    addMissing: false,
    filesByDir: {
      "run/arm64": [
        "AdGuardHome_v0.107.69_aarch64.run",
        "luci-app-homeproxy-25.197.30224-af6a147_aarch64_cortex-a53.run",
        "luci-app-store-0.1.30-1_all.run",
        "luci-app-uninstall-v1.1.8.run",
        "momo_v1.0.5_aarch64_cortex-a53.run",
        "nikki_v1.25.0_aarch64_cortex-a53.run",
        "passwall2_aarch64_a53_25.11.14-1.run",
        "ssrp_aarch64_cortex-a53-190-r117.run",
      ],
      "run/x86": [
        "AdGuardHome_v0.107.69_x86_64.run",
        "luci-app-homeproxy-25.197.30224-af6a147_x86_64.run",
        "luci-app-store-0.1.30-1_all.run",
        "luci-app-uninstall-v1.1.8.run",
        "momo_v1.0.5_x86_64.run",
        "nikki_v1.24.2_x86_64.run",
        "passwall2_x86_64_25.11.14-1.run",
        "ssrp_x86_64-190-r117.run",
      ],
    },
    assets: REMOTE_ASSETS,
  });

  const arm64 = Object.fromEntries(plan.filter((item) => item.dir === "run/arm64").map((item) => [item.to, item.from.sort()]));
  const x86 = Object.fromEntries(plan.filter((item) => item.dir === "run/x86").map((item) => [item.to, item.from.sort()]));

  assert.deepEqual(arm64["AdGuardHome_v0.107.79_aarch64.run"], ["AdGuardHome_v0.107.69_aarch64.run"]);
  assert.deepEqual(arm64["homeproxy-aarch64_cortex-a53-26.187.07809-9bce398.run"], [
    "luci-app-homeproxy-25.197.30224-af6a147_aarch64_cortex-a53.run",
  ]);
  assert.deepEqual(arm64["ssrp_mihomo_aarch64_cortex-a53-196_r9.run"], [
    "ssrp_aarch64_cortex-a53-190-r117.run",
  ]);
  assert.deepEqual(x86["nikki_v1.26.1_x86_64.run"], ["nikki_v1.24.2_x86_64.run"]);
  assert.deepEqual(x86["luci-app-store-0.2.1-r1_all.run"], ["luci-app-store-0.1.30-1_all.run"]);
  assert.equal(
    plan.some((item) => item.to.startsWith("25-") || item.to.startsWith("openclash")),
    false
  );

  const alreadyLatest = planRefresh({
    addMissing: false,
    filesByDir: {
      "run/x86": ["AdGuardHome_v0.107.79_x86_64.run"],
    },
    assets: REMOTE_ASSETS,
  });
  assert.deepEqual(alreadyLatest, []);
});

test("planRefresh collapses old ssrp and ssrp_mihomo into one latest file", () => {
  const plan = planRefresh({
    addMissing: false,
    filesByDir: {
      "run/x86": [
        "ssrp_x86_64-190-r117.run",
        "ssrp_mihomo_x86_64-196_r2.run",
      ],
    },
    assets: REMOTE_ASSETS,
  });
  assert.equal(plan.length, 1);
  assert.equal(plan[0].to, "ssrp_mihomo_x86_64-196_r9.run");
  assert.deepEqual(plan[0].from.sort(), [
    "ssrp_mihomo_x86_64-196_r2.run",
    "ssrp_x86_64-190-r117.run",
  ]);
});

test("planRefresh adds missing daily-build plugins", () => {
  const plan = planRefresh({
    filesByDir: {
      "run/arm64": ["AdGuardHome_v0.107.79_aarch64.run"],
      "run/x86": ["AdGuardHome_v0.107.79_x86_64.run"],
    },
    assets: REMOTE_ASSETS,
  });
  const arm64New = plan
    .filter((item) => item.dir === "run/arm64" && item.from.length === 0)
    .map((item) => item.to);
  const x86New = plan
    .filter((item) => item.dir === "run/x86" && item.from.length === 0)
    .map((item) => item.to);
  assert.ok(arm64New.includes("openclash-aarch64_cortex-a53-v0.47.156.run"));
  assert.ok(arm64New.includes("dufs-0.46.0-r1_aarch64_cortex-a53.run"));
  assert.ok(arm64New.includes("nikki_v1.26.1_aarch64_cortex-a53.run"));
  assert.ok(arm64New.includes("24_quickfile_1.0.16_aarch64_cortex-a53.run"));
  assert.ok(x86New.includes("openclash-x86-64-v0.47.156.run"));
  assert.ok(x86New.includes("argon-2.4.3-r20250722_x86_64.run"));
  assert.equal(plan.some((item) => item.to.startsWith("25-") || item.to.startsWith("25_")), false);
  assert.equal(plan.some((item) => /aarch32/i.test(item.to)), false);
  assert.equal(plan.some((item) => item.to.startsWith("AdGuardHome") && item.from.length > 0), false);
});
