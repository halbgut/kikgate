# Kikgate 0.3.0

[So this happended](https://medium.com/@azerbike/i-ve-just-liberated-my-modules-9045c06be67c#.cmf4j71w7), which kinda sucks. **But IMO Azer made the right call!** But there are some [problems with that](https://news.ycombinator.com/item?id=11341006), that we didn't expect.

I call it **kikgate**. That's why I named this package `kikgate`. It's my attempt to creating a fast way to check you're projects for the vulnerability. The executable checks if any you or your dependencies depend on have unpublished dependencies.

```bash
npm i -g kikgate
cd /path/to/yournpm/project
kikgate
# Now hope for the best
```

The whole thing is still pretty rough, not sure if I'll make it warm and fuzzy. But if anyone cares I'll do it.

