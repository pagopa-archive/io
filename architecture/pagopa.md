# Integration with pagoPA

## Purpose

The purpose of this document is to collect the requirements for integrating
with the pagoPA payment system. Since the official specs are huge,
this document is meant to be as a collection of notes about the most important
elements from the official documents. This document is not meant to be as an
exaustive specs document but just as a starting point to guide the initial
phase of the development.

### Non-goals

This document is not meant to define a plan of action.

## Actors

|Actor|Description|
|-----|-----------|
|`DC-BE`|Digital Citizenship backend|
|`DC-FE`|Digital Citizenship frontend (app)|
|`PPA-BE`|PagoPA backend (_nodo dei pagamenti_)|

## Network requirements

From _Specifiche di connessione v1.0.2_:

  1. The source IPs of the connections from `DC-BE` to `PPA-BE` must be static.
  1. The destination IPs of the connections from `PPA-BE` to `DC-BE` are static.

## Authentication requirements

From _Specifiche di connessione v1.0.2_:

### By PPA-BE

  1. Authentication happens at two layers (L2 and L3).
  1. At the network layer (L2), the client gets authenticated via the source IP
     of the connection.
  1. At the protocol layer (L3), the client gets authenticated via the TLS
     certificate used by the HTTPS request.
  1. The HTTPS connections must follow TLS v1.2 or later

#### Requirements for the TLS certificate

  1. Must be of type _x.509 v3 Extended Validation_
  1. Can be self signed
  1. The _Subject_ field must be equal to the FQDN of `DC-BE`
  1. Must be uploaded on the subscription portal or sent via PEC to AgID

### By DC-BE

  1. TLS connections coming from `PPA-BE` will use the same certificate based
     authentication scheme
  1. The `PPA-BE` certificate will be provided during the onboarding process

## Applicative entities

From _Specifiche Attuative Nodo v2.1_:

  1. Richiesta Pagamento Telematico (`RPT`) che è emessa dall’Ente Creditore e
     definisce gli elementi necessari a caratterizzare il pagamento da effettuare;
  1. Ricevuta Telematica (`RT`), restituita da un PSP a fronte di pagamento
     individuato da una `RPT`, che definisce gli elementi necessari a qualificare
     l’esito del pagamento richiesto;
  1. Richiesta Revoca (`RR`) che è emessa dall’ente interessato e serve a
     chiedere alla controparte la revoca di una `RT` o lo storno di un pagamento;
  1. Esito Revoca (`ER`) che è emessa dall’ente cui è stata inviata una `RT` e
     serve a fornire alla controparte l’esito della revoca di una `RT` o dello
     storno di un pagamento.

All the above objects are identified by a composite ID made of:

  * codice fiscale dell’Ente Creditore che invia la `RPT`
  * codice Identificativo Univoco di Versamento (`IUV`)

### RPT

Ogni RPT e la relativa RT possono contenere rispettivamente le informazioni
attinenti da 1 a 5 pagamenti / esiti a favore di uno stesso Ente Creditore.

#### Notable fields

  1. `identificativoDominio`: Campo alfanumerico contenente il codice fiscale della struttura che invia la richiesta di pagamento
  1. `codiceIdentificativoUnivoco`: Campo alfanumerico che può contenere il codice fiscale o, in alternativa, la partita IVA del soggetto versante. Nei casi applicabili, quando non è possibile identificare fiscalmente il soggetto, può essere utilizzato il valore `ANONIMO`
  1. `importoTotaleDaVersare`: Campo numerico (due cifre per la parte decimale, il separatore dei centesimi è il punto `.`), indicante l’importo relativo alla somma da versare.
  1. `causaleVersamento`

### Avviso push

From _Specifiche Attuative Nodo v2.1_, section 8.1.6.3 (_Processo di avvisatura in modalità Web service_).

  1. la componente di avvisatura del NodoSPC invia, attraverso la primitiva pspInviaAvvisoDigitale, l’avviso digitale alla componente di gestione mobile Back-end del PSP;
  1. la componente di gestione mobile Back-end del PSP prende in carico l'avviso, per l'inoltro alla app dell'utilizzatore finale, e fornisce conferma alla componente di avvisatura del NodoSPC;
  1. la componente di avvisatura del NodoSPC predispone l’esito dell’avviso per il canale mobile;

> Nel caso di timeout nel corso di un invio e di altre casistiche dove l’invio risultasse incerto, la riproposizione delle richieste di avviso digitale e di esito deve contenere l’informazione originale dell’elemento `identificativoMessaggioRichiesta` che ha generato il timeout, ciò per consentire alla parte che riceve l’avviso digitale oppure l’esito della consegna di riconoscere la duplicazione dell’invio e gestire correttamente l’inoltro al destinatario.

#### Notable fields

  1. `anagraficaBeneficiario`: Denominazione dell’Ente Creditore che invia la richiesta di avviso digitale.
  1. `tassonomiaAvviso`: Macro categoria di classificazione dell'avviso ad uso delle app e dell'Utilizzatore finale.
  1. `dataScadenzaPagamento`: Indica la data entro la quale si richiede che venga effettuato il pagamento secondo il formato ISO 8601 `[YYYY]-[MM]-[DD]`.
  1. `dataScadenzaAvviso`: Indica la data, successiva alla data di scadenza del pagamento, sino alla quale si ritiene valido l'avviso, secondo il formato ISO 8601 `[YYYY]-[MM]-[DD]`.
  1. `importoAvviso`: Campo numerico (due cifre per la parte decimale, il separatore dei centesimi è il punto `.`), indicante l’importo relativo alla somma da versare. Deve essere maggiore di `0.10`.
  1. `descrizionePagamento`: Testo libero a disposizione dell’Ente per descrivere le motivazioni del pagamento.


#### Tassonomia avviso

  * 0 Cartelle esattoriali
  * 1 Diritti e concessioni
  * 2 Imposte e tasse
  * 3 IMU, TASI e altre tasse comunali
  * 4 Ingressi a mostre e musei
  * 5 Multe e sanzioni amministrative
  * 6 Previdenza e infortuni
  * 7 Servizi erogati dal comune
  * 8 Servizi erogati da altri enti
  * 9 Servizi scolastici
  * 10 Tassa automobilistica
  * 11 Ticket e prestazioni sanitarie
  * 12 Trasporti, mobilità e parcheggi

## Web service protocol

  1. `PPA-BE` exposes WS-SOAP services

## Payment workflow

From _Specifiche Attuative Nodo v2.1_ 8.1.2 (_Pagamento attivato presso il PSP_).

  * Questo modello di pagamento, conosciuto anche come "Modello 3" [...], presuppone che l’utilizzatore finale sia in possesso di un avviso (analogico o digitale) contenente le indicazioni necessarie per effettuare il pagamento.
  * L’Ente Creditore che consente il pagamento deve mettere a disposizione dei PSP, attraverso il Nodo dei Pagamenti-SPC, un archivio nel quale siano già stati memorizzati i pagamenti predisposti dall’ente (Archivio Pagamenti in Attesa).
  * In caso di annullamento dell’avviso, il PSP potrà eliminare tale avviso da quelli a disposizione dell’utilizzatore finale, in caso contrario l’eventuale fase di pagamento attivata successivamente all’annullo fornirà un errore generato dall’Ente Creditore.

### Payment modes (_modelli_)

  1. Pagamento attivato presso l’Ente Creditore con re indirizzamento on-line
  1. Pagamento attivato presso l’Ente Creditore con autorizzazione non contestuale gestita dal PSP
  1. Pagamento predisposto dall’Ente Creditore e attivato presso il PSP
  1. Pagamento spontaneo attivato presso il PSP

### Notable methods

  1. `pspInviaAvvisoDigitale`
  1. `nodoAggiornaIscrizioniAvvisatura`
  1. `nodoVerificaRPT`
  1. `nodoAttivaRPT`
  1. `nodoChiediCatalogoServizi`
  1. `pspNotificaCancellazioneRPT`

### Steps

See section 9.1.2.3:

  1. Presentazione dell'Avviso: l’utilizzatore finale presenta l'avviso analogico o digitale presso il Front-End del PSP rappresentato [...] dalle applicazioni di home banking o mobile app rese disponibili dal PSP;
  1. Attivazione del pagamento: il Back-end del PSP, attraverso il NodoSPC, invia al Back-end dell'Ente Creditore la richiesta di ricevere dal sistema la RPT relativa all'avviso richiesto;
  1. Conferma del pagamento: in questa fase l'utilizzatore finale interagisce con il Front-End del PSP e decide se effettuare o meno il pagamento. In caso di consenso al pagamento, il Back- end del PSP si predispone per generare un RT positiva, in caso di abbandono si predispone per generare una RT negativa;
  1. Stampa dell'attestato: il Front-end del PSP stampa l'attestato di pagamento da consegnare all'utilizzatore finale;

## Push mode for payment notifications

From _Specifiche di connessione v1.0.2_, section 2.9 (_Avvisatura digitale
push_), paragraph 2.9.1.3 (_Iscrizione al servizio presso un Prestatore di
servizi di pagamento_) and paragraph 2.9.1.5 (_Revoca di iscrizione al servizio
di avvisatura_):

TODO

## Payment from paper notification

### QR code

From _Specifiche Attuative Nodo v2.1_, section 7.4.3.

TODO

### Barcode

From _Specifiche Attuative Nodo v2.1_, section 7.4.4.

## Auditing requirements

From _Specifiche di connessione v1.0.2_:

  1. Requests from `PPA-BE` must be logged

### Events journal

From _Specifiche Attuative Nodo v2.1_, section 5.3.11 and chapter 6 (_GIORNALE DEGLI EVENTI_).

> L'operazione di pagamento si sviluppa mediante la cooperazione applicativa tra sistemi diversi delle amministrazioni pubbliche, del Nodo dei Pagamenti-SPC e dei prestatori dei servizi di pagamento. è quindi necessario, per ricostruire il processo complessivo, che ognuno dei sistemi interessati dal pagamento telematico, si doti di funzioni specifiche per registrare i passaggi principali del trattamento dell'operazione di pagamento. Gli eventi di ingresso e di uscita dal sistema, ovvero le operazioni di interfaccia, sono punti cardine da tracciare obbligatoriamente, ai quali si aggiungono cambi di stato intermedi significativi per il singolo sistema.
> Le tracce registrate dai singoli sistemi, in caso di richiesta di verifica, devono essere estratte e confrontate con le analoghe informazioni prodotte da tutti i sistemi di collaborazione coinvolti nelle operazioni interessate.

## Runtime environments

From _Specifiche di connessione v1.0.2_:

  1. Three environments are available:
     1. `produzione`
     1. `DR`
     1. `test esterno`
