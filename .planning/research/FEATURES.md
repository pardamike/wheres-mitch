# Feature Research: Where's Mitch?

**Researched:** 2026-07-31

## Table Stakes For A Hidden-Object Game

| Feature | Complexity | Dependency |
|---------|------------|------------|
| Immediately understandable target/instructions | Low | Title UI and readable target |
| Clear finite attempts and feedback | Low | Reducer and HUD |
| Reliable target hit detection | Medium | SVG layer/input contract |
| Visually dense but decipherable scene | High | Art system and crowd layout |
| Repeatable rounds with variation | Medium | Seeded generation and scene templates |
| Correct win/loss lock and restart | Medium | State machine/cutscenes |
| Responsive stage | Medium | SVG viewBox and HUD shell |
| Sound control | Low | User-gesture Web Audio |
| Local record | Low | Safe storage adapter |

## Differentiators

| Feature | Value | Complexity | Dependency |
|---------|-------|------------|------------|
| Crowd with destinations and interactions | Makes the world feel alive instead of animated wallpaper | High | Path/behavior system |
| Target that actively relocates/hides | Turns static search into chase/search hybrid | High | Mitch AI and occlusion |
| Difficulty becoming absurdly impossible | Creates escalating comedy and inevitable run ending | Medium | Deterministic curve |
| Capitol-return cutscene | Rewards each catch with a memorable punchline | Medium | Final rigs and timeline |
| Chinese-flag helicopter escape | Signature loss payoff and shareable joke | High | Content review, rigs, audio |
| Three deeply varied templates | Replayability without a sprawling content burden | High | Reusable scene contract |
| Direct-file offline build | Easy sharing and hosting with no infrastructure | Medium | IIFE/relative build contract |

## Anti-Features

| Anti-feature | Why Excluded |
|--------------|--------------|
| Account/global leaderboard | Requires backend, abuse prevention, identity, and privacy surface |
| Endless authored levels | Content burden distracts from deep animation quality |
| Timer-based automatic loss | User already has a clear ten-attempt failure condition |
| Random crowd drift | Looks mechanical and undermines “alive” requirement |
| Target highlight/hot cursor | Defeats visual search |
| Real-time news jokes | Dates product, invites unsupported claims, and requires content maintenance |
| Photographic assets | Break visual cohesion and complicate rights/tone |
| Procedural AI/content calls | Break offline promise and create cost/latency/content risk |
| Physics engine | Rope/vehicle paths are authored and do not justify engine weight |
| PWA | Offline file artifact already satisfies portability |

## Dependency Order

1. Static artifact and deterministic state machine.
2. One complete Washington round.
3. Crowd/path/target difficulty systems.
4. Final art, cutscenes, sound, and content framing.
5. Reusable scene contract and two more settings.
6. Persistence, responsive/accessibility hardening, browser/release verification.

## Scope Conclusion

V1 is complete at three scenes and one polished endless loop. New scenes are v2 only if actual play
shows fatigue. The differentiator is not scene count; it is the density and purpose of motion.
