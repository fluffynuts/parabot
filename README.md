# parabot
proof-of-concept for parallel npm install (a "Para(llel) Bot" to install your packages)

### what it does
Attempts to install your npm packages listed in package.json in parallel. Defaults to 10 parallel jobs, but can
be instructed via the -j commandline parameter, eg:

```
 parabot -j 2 ;# installs with max two concurrent jobs
 parabot -j all   ;# spawns one job per package you depend on. Beware! May be more ferocious than you want.
```
### why?
Because npm install is slow -- and it's mainly http latency whilst it works its magic. This is
a well-known situation and the reason why you have workarounds like freight. There are suggestions to
suppress npm progress -- they're bunk. Doing so gains you a few seconds, but that's not the bulk of the
problem.

### so you think you've solved it, huh?
No. I think I've proved that it can be solved. There are likely bugs and use-cases I've missed
but I think that the point becomes clear when you time running "npm install" vs "parabot". I've seen
a preliminary install go from 3 minutes down to 1 -- and that was a small package.

What I'm really hoping is that this package might get noticed and someone might be bothered to
update npm itself.

### so why not fork and PR npm?
good point. I guess I just wanted to try it out first -- I suppose I should really get off my ass and
fork / PR. Thanks. Now I have more work to do :/

### but... this *is* an npm package? How will that help me?
You could, for example, install globally. But the most useful place for this is on your CI server, where
you might replace the pre-build "npm install" step with two steps:
```
 npm install
 ./node_modules/.bin/parabot  ; # or node_modules\.bin\parabot on windows
```