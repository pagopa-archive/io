# IO
[Read in english 🇬🇧](README.en.md)

*Indice dei contenuti* <small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>generato con markdown-toc</a></i></small>
- [Descrizione del progetto](#descrizione-del-progetto)
- [Overview architetturale](#overview-architetturale)
- [Repositories](#repositories)
  * [Repositories principali](#core-repositories)
    + [App](#app)
    + [Infra](#infra)
    + [Backend](#backend)
    + [Web](#web)
    + [Utilità](#utilities)
    + [Strumenti per lo sviluppo](#developer-tool)
  * [Iniziative](#iniziative)
    + [Carta Giovani Nazionale](#carta-giovani-nazionale)
    + [Sicilia Vola](#sicilia-vola)
    + [Green Pass](#green-pass)
- [Come contribuire](#come-contribuire)
- [Licenze](#licenze)


----

## Descrizione del progetto
TBD
## Overview architetturale
TBD

## Repositories
Di seguito le repositories dove trovare le implementazioni in codice delle funzionalità di `IO`.

### Repositories principali
#### App
*[io-app](https://github.com/pagopa/io-app)* <br/>
app IO per dispositivi mobili iOS e Android

*[io-services-metadata](https://github.com/pagopa/io-services-metadata)* <br/>
contenuti consumati dall'app.
Questa repository permette di gestire i contenuti che l'app consuma (immagini, configurazioni, banners, anagrafica comuni etc)
come se fossero codice: versionati e con processo di code review. Una volta che una PR è mergiata sul ramo principale, una pipeline dedicata
sposta i contenuti sulla CDN di app IO

#### Infra
*[io-infra](https://github.com/pagopa/io-infra)* <br/>Le definizioni Terraform delle risorse cloud utilizzate da IO.

*[io-infrastructure-live-new](https://github.com/pagopa/io-infrastructure-live-new)* <br/> TBD

*[gitops](https://github.com/pagopa/gitops)* <br/>Definizione delle CI/CD utilizzate dai repository IO per code-review e deploy
#### Backend
TBD

#### Web
*[io.italia.it](https://github.com/pagopa/io-infra)* Sito istituzionale del progetto, privacy policy, termini e condizioni.

#### Utilità
*[ts-commons](https://github.com/pagopa/ts-commons)*

*[pagopa-commons](https://github.com/pagopa/pagopa-commons)*

*[codegen-openapi-ts](https://github.com/pagopa/codegen-openapi-ts)*

*[io-spid-commons](https://github.com/pagopa/io-spid-commons)*

*[react-native-cie](https://github.com/pagopa/io-cie-sdk)* <br/>
E' la libreria inclusa in app IO per effettuare l'autenticazione tramite CIE (Carta di Identità Elettronica). 
In particolare questa repo contiene l'implementazione Android che è un adattamento dell'[SDK sviluppato da IPZS](https://github.com/italia/cieid-android-sdk).
Per quanto riguarda iOS la repo contiene solo il framework compilato e non i sorgenti che invece [sono disponibili qui](https://github.com/pagopa/io-cie-ios-sdk).
Maggiori dettagli su come l'app usa questa liberia sono disponibili [in questo documento](/assets/docs/io-app-cie.pdf)

*[io-react-native-zendesk](https://github.com/pagopa/io-react-native-zendesk)*<br/>
E' la libreria inclusa in app IO che permette agli utenti di richiedere assistenza. In particolare è una personalizzazione della libreria [react-native-zendesk-v2](https://github.com/Saranshmalik/react-native-zendesk)
modificata opportunamente per le esigenze di IO. Include l'uso degli SDK ufficiali di [Zendesk](https://www.zendesk.com/) e il layer di comunicazione tra il nativo e React Native

*[io-functions-express](https://github.com/pagopa/io-functions-express)*

*[io-functions-commons](https://github.com/pagopa/io-functions-commons)*

*[codegen-openapi-ts](https://github.com/pagopa/codegen-openapi-ts)*

#### Strumenti per lo sviluppo
*[io-app-dev-server](https://github.com/pagopa/io-dev-api-server)* <br/>
Server per lo sviluppo di app IO: usando questo strumento, che può essere in locale, non è necessario interfacciarsi ai servizi di produzione durante lo sviluppo.
Realizza tutti i servizi e gli endpoints che l'app di produzione utilizza: API del backend di IO, assets della CDN, API di pagoPA, API delle iniziative (cashback, bonus vacanze, green pass etc).
Il server è configurabile a livello di risposte e contenuti oltre a supportare, per quasi tutti i servizi, un layer di generazione casuale dei contenuti delle risposte.


### Iniziative

#### Carta Giovani Nazionale
TBD
#### Sicilia Vola
TBD
#### Green Pass
TBD

## Come contribuire
TBD

## Licenze
TBD