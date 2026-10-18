# 华夏中文学校大费城分校官网

Hugo 静态站，由原 WordPress 站 (hxgv.net) 迁移而来。

## 本地预览

```bash
~/workspace/bin/hugo server
```

## 发布

```bash
~/workspace/bin/hugo --minify
python3 ~/workspace/custom-connectors/custom.cloudflare/bin/pages_deploy.py \
  --project hxgv --dir public
```

线上地址：https://hxgv.pages.dev
