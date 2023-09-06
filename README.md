# **Panabit** Chrome 工具使用手册

## Table of Content

- [**Panabit** Chrome 工具使用手册](#panabit-chrome-工具使用手册)
  - [Table of Content](#table-of-content)
  - [1.前置条件](#1前置条件)
    - [1.1 安装 Chrome CROS 插件](#11-安装-chrome-cros-插件)
    - [1.2 安装工具插件](#12-安装工具插件)
  - [2. 配置插件](#2-配置插件)
    - [2.1 配置 API key](#21-配置-api-key)
    - [2.2 填写需要应用插件的域名或者 IP](#22-填写需要应用插件的域名或者-ip)
    - [3 Issues](#3-issues)

## 1.前置条件

### 1.1 安装 Chrome CROS 插件

[Allow CORS: Access-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)

安装后启用插件，一定要点 ON 那个按钮，也就是 logo 变彩色。

![CROS](images/cros.png)

### 1.2 安装工具插件

Relase 发布链接暂无， 要上架 Chrome Store 才有

手工安装，下载这个 Repo 后，在 Chrome 的插件里选择打开这个文件夹

![img](images/add2chrome.png)

## 2. 配置插件

安装好以后在 Chrome 插件里 选择 配置/Option

![Find Option](images/option.png)

### 2.1 配置 API key

[去 maclookup.app 申请一个 key](https://my.maclookup.app/)

然后填进去

![img](images/apikey.png)

```text
    注意：如果不填 key 也能用，但是会有一堆 HTTP 429 的返回，就是限制请求数量
```

### 2.2 填写需要应用插件的域名或者 IP

![img](images/ipdomain.png)

```markdown
    + 注意：如果不填 IP 也能用，但是最好填一个, 不然就是只判断网页名叫Panabit的窗口
    - 也支持 IPv6 和 域名
```

### 3 Issues

- Known Issue: 验证配置的 ip 地址还有点小毛病
  
- 其他请去 Issues 里提
