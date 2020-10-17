---
title: 清理Docker镜像
date: 2020-09-06 23:37:45
tags: docker
---
清理docker ci 服务中冗余镜像

```

docker rmi $(docker images --filter "dangling=true" -q --no-trunc)

```