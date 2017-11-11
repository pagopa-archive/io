# [Cittadinanza digitale](https://teamdigitale.github.io/cittadinanza-digitale/)

## Introduzione

L'iniziativa di Cittadinanza digitale mira ad agevolare la relazione tra i cittadini e la Pubblica Amministrazione (PA) attraverso la creazione di una piattaforma di componenti riutilizzabili in grado di rendere i servizi digitali più efficaci e migliorare la comunicazione cittadino-PA.

I componenti vengono riutilizzati dalle amministrazioni che erogano servizi digitali al fine di garantire un'esperienza utente coerente nonché risparmiare sull'effort richiesto da un'implementazione *tout-court* di tali tecnologie trasversali.

<table>
<caption>
Componenti della Cittadinanza digitale
</caption>
<thead>
<tr>
  <th> Identità </th>
  <th> Preferenze </th>
  <th> Comunicazioni </th>
  <th> Transazioni finanziarie </th>
  <th> Archiviazione </th>
</tr>
</thead>
<tbody>
<tr>
  <td> Credenziali e informazioni personali (SPID) </td>
  <td> Preferenze personali orizzontali (ad es. Lingua) e verticali (di un servizio specifico) </td>
  <td> Ricezione di avvisi di cortesia e notifiche legali </td>
  <td> Pagamenti e crediti (pagoPA) </td>
  <td> Archivio digitale di tutta la documentazione </td>
</tr>
</tbody>
</table>

L'integrazione dei vari componenti nei servizi digitali forniti dalla Pubblica Amministrazione consentirà al cittadino di vivere l'esperienza di cittadinanza digitale, portando la sua identità e le informazioni trasversalmente ai diversi servizi.

Oltre ai componenti esistenti (pagoPA, SPID), AgID intende fornire ulteriori servizi alle Pubbliche Amministrazioni realizzando i componenti della Cittadinanza Digitale in relazione alle 'Preferenze' dei cittadini e alle 'Comunicazioni' con la PA.

## Comunicazioni

Le amministrazioni saranno in grado di inviare notifiche multicanale (e-mail, notifiche PUSH, ecc.) ai cittadini che hanno sottoscritto un particolare argomento di interesse (opt-in) sui portali PA e/o hanno indicato uno o più recapiti per ricevere avvisi dalla Pubblica Amministrazione (ad es. scadenze, pagamenti, cambiamenti di stato di una pratica inoltrata).

Il cittadino interagisce con un unico servizio di gestione delle preferenze (SGP); questo verrà interrogato dal sistema per l'invio delle comunicazioni al fine di reperire i canali di inoltro preferito e gli indirizzi di contatto del destinatario. Il cittadino non ha quindi accesso diretto al sistema: i sistemi informativi delle parti coinvolte nel servizio potranno inviare comunicazioni ai cittadini attraverso l'API fornita.

Le amministrazioni avranno piena visibilità delle comunicazioni (e del loro stato), limitatamente a quelle di cui sono esse stesse i mittenti.

### API correlate

- [API notifiche](api/notifications.html)

## Preferenze

Il sistema di gestione delle preferenze (SGP) consente al cittadino di gestire centralmente le impostazioni di personalizzazione relative ai servizi digitali forniti dalla Pubblica Amministrazione. Per esempio:

- Uno o più indirizzi per ricevere comunicazioni
- Canali di comunicazione e tipologie di sottoscrizione
- Metodi di pagamento preferiti (pagoPA)

Attraverso queste informazioni, SGP fornisce alle amministrazioni che lo consultano l'opportunità di personalizzare i propri servizi digitali. I cittadini non hanno accesso diretto al sistema: i sistemi di amministrazione dell'amministrazione utilizzano l'API per accedere (leggere) gli attributi gestiti dal SGP per conto dei cittadini che si autenticano sui loro servizi digitali.

### API correlate

- [Preferenze API](api/preferences.html)

## Vantaggi

### Per i cittadini

- gestire i contatti di consegna da un punto di accesso centrale (sito APP mobile e italia.it)
- gestire le sottoscrizioni (opt-in e opt-out) da un punto di accesso centrale
- accedere alla cronologia delle comunicazioni da un punto di accesso centrale
- effettuare semplici operazioni transazionali mediante notifiche ricevute (es. pagamenti)

### Per le amministrazioni

- inviare comunicazioni elettroniche anche senza conoscere gli indirizzi di contatto dei cittadini, utilizzando solo il codice fiscale
- delegare la gestione e l'aggiornamento dei contatti di consegna elettronica dei cittadini
- dare maggiore visibilità alle proprie notifiche, laddove confluiscono in un contesto più ampio / nazionale
- richiamare le scadenze e facilitare i pagamenti in modo semplice e sicuro
- trasmettere gratuitamente comunicazioni multicanale (email, push notification)
- assegnare uno stato alle comunicazioni (per esempio per monitorare lo stato di una pratica)
- ottenere lo stato di consegna (inviato, ricevuto) della comunicazione e possibilmente la lettura del messaggio laddove il canale lo consente

## Casi d'uso 

### Avvisi di cortesia

- invio di promemoria (es. screening)
- invio di scadenze (es. di un documento)
- comunicazioni relative a nuove gare o contratti
- comunicazioni scuola-famiglia
- comunicazioni che contengono informazioni per pagamenti da effettuare tramite App od online (es. tributi ricorrenti, multe)
- comunicazioni relative allo stato di un flusso di lavoro avviato per conto del cittadino (es. "pratica presa in carico", "prenotazione accettata") migliorando l'efficienza dei punti di contatto

## Roadmap

- primo prototipo (*closed beta*) con amministrazioni pilota per l'invio di avvisi di cortesia notificati via email o push notification
- integrazione di altri canali di comunicazione (es. messaggistica istantanea, SMS, cartaceo)
- realizzazione del domicilio digitale (elenco recapiti elettronici certificati)
- cifratura e firma dei messaggi
- invio di notifiche a valore legale

## API docs

- [API notifiche](api/notifications.html)
- [Preferenze API](api/preferences.html)