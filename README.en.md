[Leggi in italiano 🇮🇹](README.md)
# IO
> 💡 This is the starting point for everyone interested in learning more about `IO`, how it works, its tech, its domain logics and its implementation choices. In here you can find a high-level description of architecture, components and main workflows; with no mean to be exhaustive in this repository, we hope it will help you to navigate through the ecosystem of applications and libraries that make up the platform `IO`.<br/>For any information about the project, how to use it and its data policies, please refer to the [project website](https://io.italia.it).

*Indice dei contenuti* <small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>generated with markdown-toc</a></i></small>
- [Description](#description)
- [Architectural overview](#architectural-overview)
- [Repositories](#repositories)
  * [Core repositories](#core-repositories)
    + [App](#app)
    + [Infra](#infra)
    + [Backend](#backend)
    + [Web](#web)
    + [Utilities](#utilities)
    + [Developer tool](#developer-tool)
  * [Initiatives](#iniziatives)
    + [Carta Giovani Nazionale](#carta-giovani-nazionale)
    + [Sicilia Vola](#sicilia-vola)
    + [Green Pass](#green-pass)
- [Contributing](#contributing)
- [License](#license)


----

## Description
TBD
## Architectural overview
`IO` is a platform composed by an ecosystem of network applications.

The designated _touch point_ for Citizens is **App IO**, a mobile application for iOS and Android smartphones, through which they have access to all services offered onto `IO` platform by Public Organizations. Citizens are identified by third-party _Identity Provider_ such as [SPID providers](https://www.spid.gov.it/) and [CIE] (https://www.ipzs.it/ext/carta_identita_elettronica_prodotti.html) service (Carta d'identità elettronica) powered by [Istituto Poligrafico e Zecca dello Stato](https://www.ipzs.it).

Organizations can integrate their IT systems by using both web portals and exposed API.<br/>If you are an Organization and you are willing to know how to integrate with `IO`, please refer to [our website](https://io.italia.it/).

![architecture overview](assets/architecture-overview.png)

`IO` platform has been designed with these principles in mind:
* _micreservices architecture_: the system is composed by several independent network applications that collaborate to business workflows;
* _everything as code_: we try to code as much as we can, including the infrastructure as well as code-review rules and code best practices;
* _open by design_: source code is open and public as well as technical discussions arising from pull requests.

To know more about how such principles are implemented, please refer to application-specific repositories mentioned below.

## Repositories
Here are the repositories on which you can find the actual implementations of `IO` project's features.


### Core repositories
#### App
*[io-app](https://github.com/pagopa/io-app)* <br/>IO app for iOS and Android devices

*[io-services-metadata](https://github.com/pagopa/io-services-metadata)* <br/>
Static assets used by the app.
This repository allows you to manage the contents that the app consumes (images, configurations, banners, municipalities data etc)
as if they are code: versioned and with a code review process. Once a PR is merged on the main branch, a dedicated pipeline
moves contents into IO CDN.

#### Infra
*[io-infra](https://github.com/pagopa/io-infra)* <br/>Terraform definitions for cloud resources used by `IO`.

*[io-infrastructure-live-new](https://github.com/pagopa/io-infrastructure-live-new)* <br/> TBD

*[gitops](https://github.com/pagopa/gitops)* <br/>CI/CD definitions used by `IO`'s code-review and deploy workflows.
#### Backend
*[io-backend](https://github.com/pagopa/io-backend)* <br/>
Application gateway which exposes `IO`'s API to the app. Its main responsibilities are to manage Citizens' user session an to aggregate and proxy communication towards microservices that implement the actual business logic. It's also the only integration point with our _Identity Providers_.

*[io-functions-app](https://github.com/pagopa/io-functions-app)* <br/>Function app implementing le business logics about Citizens integractions with the app.

*[io-functions-admin](https://github.com/pagopa/io-functions-admin)* <br/>Function app implementing administrative logics as well as long running processes.

*[io-functions-services](https://github.com/pagopa/io-functions-services)* <br/>Function app implementing le business logics about Organizations integractions with `IO` platform.

*[io-functions-public-event-dispatcher](https://github.com/pagopa/io-functions-public-event-dispatcher)* <br/>It allows to register webhooks on which get notified when a domain event occurs in the platform.

*[io-functions-pushnotifications](https://github.com/pagopa/io-functions-pushnotifications)* <br/>It manages the interactions with platform-specific push notification services.

*[io-functions-assets](https://github.com/pagopa/io-functions-assets)* <br/>Proxy towards static assets consumed by the app.

#### Web
*[io.italia.it](https://github.com/pagopa/io.italia.it)* Website and legal stuff.

#### Utilities
*[ts-commons](https://github.com/pagopa/ts-commons)*

*[pagopa-commons](https://github.com/pagopa/pagopa-commons)*

*[codegen-openapi-ts](https://github.com/pagopa/codegen-openapi-ts)*

*[io-spid-commons](https://github.com/pagopa/io-spid-commons)*

*[react-native-cie](https://github.com/pagopa/io-cie-sdk)* <br/>
Library included in the IO app to authenticate via CIE (Electronic Identity Card). It contains the Android implementation which is an adaptation of the [SDK developed by IPZS](https://github.com/italia/cieid-android-sdk). 
As for iOS, the repository contains only the compiled framework and not the sources [that are available here](https://github.com/pagopa/io-cie-ios-sdk). More details on how the app uses this library can be found in [this document](https://github.com/pagopa/io/blob/add-io-app-repo/assets/docs/io-app-cie.pdf)

*[io-react-native-zendesk](https://github.com/pagopa/io-react-native-zendesk)* <br/>
Library included in the IO app that allows users to request assistance. 
In particular it is a customization of the [react-native-zendesk-v2](https://github.com/Saranshmalik/react-native-zendesk) library modified appropriately for the needs of IO. 
It includes the official [Zendesk](https://www.zendesk.com/) SDKs and the communication layer between the native and React Native

*[io-functions-express](https://github.com/pagopa/io-functions-express)*

*[io-functions-commons](https://github.com/pagopa/io-functions-commons)*

#### Developer tool
*[io-app-dev-server](https://github.com/pagopa/io-dev-api-server)* <br/>
Server for IO app development: using this tool, that can be run locally, there is no need to interface with production services during development. 
It creates all the services and endpoints that the production app uses: IO backend API, CDN assets, pagoPA API, initiative API (cashback, bonus vacanze, green pass etc). 
The server is configurable at the response and content level as well as supporting, for almost all services, a random generation layer of the response content.

### Initiatives

#### Carta Giovani Nazionale
TBD
#### Sicilia Vola
TBD
#### Green Pass
TBD

## Contributing
TBD

## License
TBD