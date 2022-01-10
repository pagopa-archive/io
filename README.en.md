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
`IO` is a platform composed by an ecosystem of network applications.

The designated _touch point_ for Citizens is **App IO**, a mobile application for iOS and Android smartphones, through which they have access to all services offered onto `IO` platform by Public Organizations. Citizens are idetified by third-party _Identity Provider_ such as [SPID providers](https://www.spid.gov.it/) and [CIE] (https://www.ipzs.it/ext/carta_identita_elettronica_prodotti.html) service (Carta d'identità elettronica) powered by [Istituto Poligrafico e Zecca dello Stato](https://www.ipzs.it).

Organizations can integrate their IT systems by using both web portals and exposed API.<br/>If you are an Organization and you are willing to know how to integrate with `IO`, please refer to [our website](https://io.italia.it/).

![architecture overview](assets/architecture-overview.png)

`IO` platform has been designed with these principles in mind:
* _micreservices architecture_: the system is composed by several independent network applications that collaborate to business workflows;
* _everything as code_: we try to code as much as we can, including the infratructure as well as code-review rules and code best practices;
* _open by design_: source code is open and public as well as technical discussions arising from pull requests.

To know more about how such principles are implemented, please refer to application-specific repositories mentioned below.

## Repositories
Here are the repositories on which you can find the actual implementations of `IO` project's features.


### Core repositories
#### App
*[io-app](https://github.com/pagopa/io-app)* <br/>Mobile application for iOS e Android
#### Infra
*[io-infra](https://github.com/pagopa/io-infra)* <br/>Terraform definitions for cloud resources used by `IO`.

*[io-infrastructure-live-new](https://github.com/pagopa/io-infrastructure-live-new)* <br/>

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

*[react-native-cie](https://github.com/pagopa/react-native-cie)*

*[react-native-zendesk](https://github.com/pagopa/react-native-zendesk)*

*[io-functions-express](https://github.com/pagopa/io-functions-express)*

*[io-functions-commons](https://github.com/pagopa/io-functions-commons)*

#### Developer tool
TBD

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