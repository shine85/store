# store

此项目用于存储 [ImmortalWrt-ImageBuilder](https://github.com/wukongdaily/ImmortalWrt-ImageBuilder) 仓库以外的第三方软件包。
软件包版权归原作者，见下表。

本仓库是 [`wukongdaily/store`](https://github.com/wukongdaily/store) 的 fork，并额外用每日构建同步 `.run` 插件。

## 插件如何保持最新

每天 02:00 UTC（北京时间 10:00）自动执行，也可在 Actions 里手动 Run workflow：

1. 先从上游 [`wukongdaily/store`](https://github.com/wukongdaily/store) 同步目录和 ipk
2. 再按 [RunFilesBuilder 讨论 #41](https://github.com/wukongdaily/RunFilesBuilder/discussions/41)，用 [`wkccd/CloudRunFilesBuilder` releases](https://github.com/wkccd/CloudRunFilesBuilder/releases/) 的每日构建同步 `.run`：已有的覆盖，没有的新增到 `run/arm64/` 和 `run/x86/`

不同步 `25-` / `25_` 前缀（25.12 线另有仓库）和 aarch32。
`.run` 当前版本以 `run/arm64/`、`run/x86/` 下的文件名为准。

工作流：`.github/workflows/sync-upstream.yml`

## 软件包列表

| 软件名称 | 简介 / 功能描述 | 来源 / 项目地址 |
| --- | --- | --- |
| luci-app-store | iStore 应用商店 | [linkease/istore](https://github.com/linkease/istore) |
| luci-app-quickstart | iStore 首页和网络向导 | [linkease/luci-app-quickstart](https://github.com/linkease/nas-packages-luci/tree/main/luci/luci-app-quickstart) |
| luci-app-unishare | 统一文件共享 / WebDAV | [linkease/luci-app-unishare](https://github.com/linkease/nas-packages-luci/tree/main/luci/luci-app-unishare) |
| luci-app-amlogic | 晶晨宝盒（仅 ARM64） | [ophub/luci-app-amlogic](https://github.com/ophub/luci-app-amlogic) |
| luci-app-adguardhome | 本地 DNS 去广告 | [AdGuardTeam/AdGuardHome](https://github.com/AdguardTeam/AdGuardHome) |
| luci-app-advancedplus | 高级设置 | [sirpdboy/luci-app-advancedplus](https://github.com/sirpdboy/luci-app-advancedplus) |
| luci-app-netwizard | 网络配置向导 | [sirpdboy/luci-app-netwizard](https://github.com/sirpdboy/luci-app-netwizard) |
| luci-app-partexp | 分区扩容 | [sirpdboy/luci-app-partexp](https://github.com/sirpdboy/luci-app-partexp) |
| luci-theme-kucat | 酷猫主题 | [sirpdboy/luci-theme-kucat](https://github.com/sirpdboy/luci-theme-kucat) |
| luci-app-taskplan | 任务计划 | [sirpdboy/luci-app-taskplan](https://github.com/sirpdboy/luci-app-taskplan) |
| luci-app-watchdog | OpenWrt 看门狗 | [sirpdboy/luci-app-watchdog](https://github.com/sirpdboy/luci-app-watchdog) |
| luci-app-turboacc | TurboACC 网络加速（BBR、shortcut） | [chenmozhijin/turboacc](https://github.com/wukongdaily/store/tree/master/run/x86/luci-app-turboacc) |
| luci-app-mosdns | 高性能 DNS 分流，支持 DoH/DoQ | [sbwml/luci-app-mosdns](https://github.com/sbwml/luci-app-mosdns) |
| luci-app-nekobox | 代理工具 | [Thaolga/openwrt-nekobox](https://github.com/Thaolga/openwrt-nekobox) |
| luci-app-nikki | 代理工具 | [nikkinikki-org/OpenWrt-nikki](https://github.com/nikkinikki-org/OpenWrt-nikki) |
| luci-app-momo | 代理工具 | [nikkinikki-org/OpenWrt-momo](https://github.com/nikkinikki-org/OpenWrt-momo) |
| luci-app-homeproxy | 代理工具 | [immortalwrt/homeproxy](https://github.com/immortalwrt/homeproxy) |
| luci-app-passwall | 代理工具 | [xiaorouji/openwrt-passwall](https://github.com/xiaorouji/openwrt-passwall) |
| luci-app-passwall2 | 代理工具 | [Openwrt-Passwall/openwrt-passwall2](https://github.com/Openwrt-Passwall/openwrt-passwall2) |
| luci-app-ssr-plus | 代理工具（SSRP / mihomo） | [fw876/helloworld](https://github.com/fw876/helloworld) |
| clashoo | 代理工具 | [kenzok8/openwrt-clashoo](https://github.com/kenzok8/openwrt-clashoo) |
| tailscale | 基于 WireGuard 的组网 | [tailscale/tailscale](https://github.com/tailscale/tailscale) |
| luci-app-tailscale-community | Tailscale（Community） | [Tokisaki-Galaxy/luci-app-tailscale-community](https://github.com/Tokisaki-Galaxy/luci-app-tailscale-community) |
| luci-app-lucky | Lucky 大吉，端口转发 / 反向代理 | [gdy666/lucky](https://github.com/gdy666/lucky) |
| luci-app-gecoosac | 集客 AC | [lwb1978/openwrt-gecoosac](https://github.com/lwb1978/openwrt-gecoosac) |
| luci-app-easytier | 组网 | [EasyTier/luci-app-easytier](https://github.com/EasyTier/luci-app-easytier) |
| luci-app-uninstall | 高级卸载 | [出处视频](https://www.bilibili.com/video/BV1dK1xBVEHF) |
| luci-theme-aurora | 极光主题 | [eamonxg/luci-theme-aurora](https://github.com/eamonxg/luci-theme-aurora) |
| luci-theme-argon | Argon 主题 | [jerrykuku/luci-theme-argon](https://github.com/jerrykuku/luci-theme-argon) |
| luci-app-bandix | Bandix 流量监控 | [timsaya/luci-app-bandix](https://github.com/timsaya/luci-app-bandix) |
| luci-app-rtp2httpd | IPTV 流媒体转发 | [stackia/rtp2httpd](https://github.com/stackia/rtp2httpd) |
| luci-app-quickfile | 轻量网页文件管理器 | [sbwml/luci-app-quickfile](https://github.com/sbwml/luci-app-quickfile) |
| dufs | 文件服务器 | [sigoden/dufs](https://github.com/sigoden/dufs) |
| luci-app-run | run 插件安装器 | [wukongdaily/RunFilesBuilder](https://github.com/wukongdaily/RunFilesBuilder) |
| luci-app-openclash | 代理工具 | [vernesong/OpenClash](https://github.com/vernesong/OpenClash) |
| openlist2 | 网盘 / 文件列表 | [OpenListTeam/OpenList](https://github.com/OpenListTeam/OpenList) |
| daed | 代理工具 | [daeuniverse/daed](https://github.com/daeuniverse/daed) |
| sing-box | 代理核心 | [SagerNet/sing-box](https://github.com/SagerNet/sing-box) |
| xray-core | 代理核心 | [XTLS/Xray-core](https://github.com/XTLS/Xray-core) |

## 如何集成到 AutoBuildImmortalWrt

https://github.com/wukongdaily/AutoBuildImmortalWrt/discussions/209

## 其它 GitHub Action 项目

- [一键生成 run 插件](https://github.com/wukongdaily/RunFilesBuilder)
- [一键生成 docker 离线镜像](https://github.com/wukongdaily/DockerTarBuilder)
- [OpenWrt/Armbian IMG 安装器](https://github.com/wukongdaily/img-installer)

## 25.12.x 相关仓库

[25.12.x 相关仓库](https://github.com/wukongdaily/apk)