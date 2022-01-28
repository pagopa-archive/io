[Read in english 🇬🇧](README.en.md)
# IO
> 💡 Questo è il punto d'inizio dedicato a chiunque voglia approfondire come funziona `IO`, la sua tecnologia, le logiche di dominio e le scelte implementative. Qui troverai la descrizione ad alto livello dell'architettura, dei componenti e dei flussi principali; senza pretendere di essere esaustivi in questo repository, speriamo ti aiuti ad orientarti nell'ecosistema di applicazioni e librerie che compongono la piattaforma `IO`.<br/>Per informazioni sul progetto, sull'utilizzo e sul trattamento dei dati, per favore consulta il [sito web](https://io.italia.it) del progetto.

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
`IO` è una piattaforma composta da un ecosistema di applicazioni rete.

Il _touch point_ per i Cittadini è l'**App IO**, applicazione mobile per iOS e Android, attraverso la quale essi possono accedere ai servizi offerti sulla piattaforma `IO` dagli Enti della Pubblica Amministrazione. L'identificazione dei Cittadini è delegata a _Identity Provider_ terzi quali i [provider SPID](https://www.spid.gov.it/) e l'apposito servizio [CIE](https://www.ipzs.it/ext/carta_identita_elettronica_prodotti.html) (Carta d'identità elettronica) fornito da [Istituto Poligrafico e Zecca dello Stato](https://www.ipzs.it).

Gli Enti e le Organizzazioni possono integrare i loro sistemi informativi utilizzando sia i portali messi a disposizione da `IO` che le API esposte.<br/>_Se sei un Ente o Organizzazione e vuoi maggiori informazioni su come integrare i tuoi servizi su `IO`, per favore consulta il [nostro sito web](https://io.italia.it/)._

![architecture overview](assets/architecture-overview.png)

La piattaforma `IO` è progettata ispirandosi ai seguenti principi:
* _architettura a microservizi_: il sistema si compone di molteplici applicazioni di rete che collaborano alla realizzazione dei flussi di dominio;
* _everything as code_: cerchiamo di descrivere tutto tramite il codice, incluso l'infrastruttura, le logiche di code-review e le scelte di code design;
* _open by design_: il codice sorgente è pubblico e aperto così come le discussioni tecniche che si sviluppano sulle pull-request di ogni repository.

Per approfondire come questi principi vengono implementati si rimanda alle repositories relative ai singoli progetti riportate di seguito.


## Repositories
Di seguito le repositories dove trovare le implementazioni in codice delle funzionalità di `IO`.

### Repositories principali
#### App
*[io-app](https://github.com/pagopa/io-app)* <br/>
app IO per dispositivi mobili iOS e Android

*[io-services-metadata](https://github.com/pagopa/io-services-metadata)* <br/>
Contenuti statici usati dall'app.
Questa repository permette di gestire i contenuti che l'app consuma (immagini, configurazioni, banners, anagrafica comuni etc)
come se fossero codice: versionati e con processo di code review. Una volta che una PR che propone dei contenuti viene mergiata sul ramo principale, una pipeline dedicata
sposta i contenuti sulla CDN di app IO

#### Infra
*[io-infra](https://github.com/pagopa/io-infra)* <br/>Le definizioni Terraform delle risorse cloud utilizzate da IO.

*[io-infrastructure-live-new](https://github.com/pagopa/io-infrastructure-live-new)* <br/> TBD

*[gitops](https://github.com/pagopa/gitops)* <br/>Definizione delle CI/CD utilizzate dai repository IO per code-review e deploy
#### Backend
*[io-backend](https://github.com/pagopa/io-backend)* <br/>Application gateway che espone le API della piattaforma `IO` verso l'app. Si occupa gestire la sessione utente dei Cittadini e aggregare le chiamate verso i diversi microservizi che implementano le business logic. E' il punto unico di integrazione con gli _Identity Provider_.

*[io-functions-app](https://github.com/pagopa/io-functions-app)* <br/>Function app che implementa le business logic delle interazioni del Cittadino con la piattaforma.

*[io-functions-admin](https://github.com/pagopa/io-functions-admin)* <br/>Function app che implementa attività di amministrazione piuttosto che processi batch.

*[io-functions-services](https://github.com/pagopa/io-functions-services)* <br/>Function app che implementa le business logic delle interazioni degli Enti e delle Organizzazioni con la piattaforma.

*[io-functions-public-event-dispatcher](https://github.com/pagopa/io-functions-public-event-dispatcher)* <br/>Permette di registrare dei webhook che reagiscono agli eventi di dominio che vengono emessi nei vari flussi.

*[io-functions-pushnotifications](https://github.com/pagopa/io-functions-pushnotifications)* <br/>Gestisce l'integrazione con i servizi di push notification.

*[io-functions-assets](https://github.com/pagopa/io-functions-assets)* <br/>Proxy verso gli asset statici usati dall'app.


#### Web
*[io.italia.it](https://github.com/pagopa/io.italia.it)* Sito istituzionale del progetto, privacy policy, termini e condizioni.

#### Utilità
*[ts-commons](https://github.com/pagopa/ts-commons)*

*[pagopa-commons](https://github.com/pagopa/pagopa-commons)*

*[codegen-openapi-ts](https://github.com/pagopa/codegen-openapi-ts)*

*[io-spid-commons](https://github.com/pagopa/io-spid-commons)*

*[react-native-cie](https://github.com/pagopa/io-cie-sdk)* <br/>
E' la libreria inclusa in app IO per effettuare l'autenticazione tramite CIE (Carta di Identità Elettronica). 
In particolare contiene l'implementazione Android che è un adattamento dell'[SDK sviluppato da IPZS](https://github.com/italia/cieid-android-sdk).
Per quanto riguarda iOS la repository contiene solo il framework compilato e non i sorgenti che invece [sono disponibili qui](https://github.com/pagopa/io-cie-ios-sdk).
Maggiori dettagli su come l'app usa questa liberia sono disponibili [in questo documento](/assets/docs/io-app-cie.pdf)

*[io-react-native-zendesk](https://github.com/pagopa/io-react-native-zendesk)*<br/>
E' la libreria inclusa in app IO che permette agli utenti di richiedere assistenza. In particolare è una personalizzazione della libreria [react-native-zendesk-v2](https://github.com/Saranshmalik/react-native-zendesk)
modificata opportunamente per le esigenze di IO. Include l'uso degli SDK ufficiali di [Zendesk](https://www.zendesk.com/) e il layer di comunicazione tra il nativo e React Native

*[push-notificator](https://github.com/pagopa/push-notificator)* <br/>
Semplice app desktop per l'invio di push notification verso emulatori iOS

*[io-functions-express](https://github.com/pagopa/io-functions-express)*

*[io-functions-commons](https://github.com/pagopa/io-functions-commons)*

*[codegen-openapi-ts](https://github.com/pagopa/codegen-openapi-ts)*

#### Strumenti per lo sviluppo
*[io-app-dev-server](https://github.com/pagopa/io-dev-api-server)* <br/>
Server per lo sviluppo di app IO: usando questo strumento, che può essere eseguito in locale, non è necessario interfacciarsi ai servizi di produzione.
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