# Digital Citizenship Initiative

## Documentation

https://teamdigitale.github.io/cittadinanza-digitale/

### Architecture decisions

We use [ADR](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)s to track architectural decisions of this initiative.

This repository is configured for Nat Pryce's [_adr-tools_](https://github.com/npryce/adr-tools).

### API definitions

- [Notifications API](https://teamdigitale.github.io/cittadinanza-digitale/api/notifications.html)
- [Preferences API](https://teamdigitale.github.io/cittadinanza-digitale/api/preferences.html)

## Usage

To lint specs with swagger-node: 
```
npm run verify
```

To edit specs with swagger-editor:
```
npm run edit
``` 

To run the mock server(s) in mock mode:
```
npm run mock
```

To run the API server(s):
```
npm run serve
```

To run documentation site locally:
```
mkdocs serve
```

To deploy docs to gh-pages:
```
mkdocs gh-deploy
```
