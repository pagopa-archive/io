# IO
[Leggi in italiano 🇮🇹](README.md)

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
TBD

## Repositories
Here are the repositories on which you can find the actual implementations of `IO` project's features.


### Core repositories
#### App
*[io-app](https://github.com/pagopa/io-app)* <br/>IO app for iOS and Android devices

*[io-services-metadata](https://github.com/pagopa/io-services-metadata)* <br/>
Static assets used by the app.
This repository allows you to manage the contents that the app consumes (images, configurations, banners, municipalities data etc)
as if they are code: versioned and with a code review process. Once a PR is merged on the main branch, a dedicated pipeline
moves contents into IO CDN

#### Infra
*[io-infra](https://github.com/pagopa/io-infra)* <br/>Terraform definitions for cloud resources used by `IO`.

*[io-infrastructure-live-new](https://github.com/pagopa/io-infrastructure-live-new)* <br/> TBD

*[gitops](https://github.com/pagopa/gitops)* <br/>CI/CD definitions used by `IO`'s code-review and deploy workflows.
#### Backend
TBD

#### Web
*[io.italia.it](https://github.com/pagopa/io-infra)* Website and legal stuff.

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