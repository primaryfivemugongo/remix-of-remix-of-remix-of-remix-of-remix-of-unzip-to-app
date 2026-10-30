# Roadmap

- [ ] Replace the voting subsystem with the uploaded repository, preserve its voting UI with school-blue colours, integrate existing portal accounts, and verify voting and administration.

- [x] Add school crest page-loading overlay with spinning blue outer ring; verified delayed page navigation on desktop and phone, no runtime errors, and all three routing/entrance tests passed.

- [x] Replace orange theme with school blue and match the supplied Google button design; verified blue colours and narrow-screen layout.

- [x] Set up student account schema and protected Google links; verified anonymous access is denied.
- [x] Add Google sign-in with password-confirmed existing account matching and immediate new student creation.
- [x] Add secure student Google link/unlink account settings.
- [x] Test account rules, live portal login, password rejection, password save, and settings restoration.
- [ ] Complete real Google consent, account matching/new student provisioning, and link/unlink end-to-end — blocked on interactive Google sign-in.

- [x] Move playful transitions into page content; signed-in student navigation shows one entrance per new page, no outgoing-page reanimation, and no runtime errors (three tests passed).

- [x] Update PUPIL_SESSION_SECRET value (old value deleted, fresh 64-char random value generated)
- [x] Verify Drizzle migrations cleared and empty set rescaffolded (already empty: no SQL files, empty journal)
- [x] Replace school login portal background image with uploaded screenshot (verified via screenshot)
- [x] Make crest + school name in top nav clickable → redirect to user's home dashboard (build OK; not click-tested signed-in)
