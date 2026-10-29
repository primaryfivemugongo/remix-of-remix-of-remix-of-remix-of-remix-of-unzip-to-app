# Roadmap

- [ ] Set up student account schema and protected Google links.
- [ ] Add Google sign-in with password-confirmed existing account matching and immediate new student creation.
- [ ] Add secure student Google link/unlink account settings.
- [ ] Test account rules and live sign-in/settings flows; identify any Google consent blocker.

- [x] Move playful transitions into page content; signed-in student navigation shows one entrance per new page, no outgoing-page reanimation, and no runtime errors (three tests passed).

- [x] Update PUPIL_SESSION_SECRET value (old value deleted, fresh 64-char random value generated)
- [x] Verify Drizzle migrations cleared and empty set rescaffolded (already empty: no SQL files, empty journal)
- [x] Replace school login portal background image with uploaded screenshot (verified via screenshot)
- [x] Make crest + school name in top nav clickable → redirect to user's home dashboard (build OK; not click-tested signed-in)
