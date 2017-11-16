Cittadinanza digitale
=====================

Introduzione
------------

L’iniziativa di Cittadinanza digitale mira ad agevolare la relazione tra
i cittadini e la Pubblica Amministrazione (PA) attraverso la creazione
di una piattaforma di componenti riutilizzabili in grado di rendere i
servizi digitali più efficaci e migliorare la comunicazione
cittadino-PA.

I componenti vengono riutilizzati dalle amministrazioni che erogano
servizi digitali al fine di garantire un’esperienza utente coerente
nonché risparmiare sull’effort richiesto da un’implementazione
*tout-court* di tali tecnologie trasversali.

.. table:: Componenti della Cittadinanza digitale

+----------------------------+-----------------------------+---------------------+-------------------------+-------------------+
| Identità                   | Preferenze                  | Comunicazioni       | Transazioni finanziarie | Archiviazione     |
+----------------------------+-----------------------------+---------------------+-------------------------+-------------------+
| Credenziali e informazioni | Preferenze personali        | Ricezione di avvisi | Pagamenti e crediti     | Archivio digitale |
| personali (SPID)           | orizzontali (ad es. Lingua) | di cortesia         | (pagoPA)                | di tutta la       |
|                            | e verticali (di un servizio | e notifiche legali  |                         | documentazione    |
|                            | specifico)                  |                     |                         |                   |
+----------------------------+-----------------------------+---------------------+-------------------------+-------------------+

L’integrazione dei vari componenti nei servizi digitali forniti dalla
Pubblica Amministrazione consentirà al cittadino di vivere l’esperienza
di cittadinanza digitale, portando la sua identità e le informazioni
trasversalmente ai diversi servizi.

Oltre ai componenti esistenti (pagoPA, SPID), AgID intende fornire
ulteriori servizi alle Pubbliche Amministrazioni realizzando i
componenti della Cittadinanza Digitale in relazione alle ‘Preferenze’
dei cittadini e alle ‘Comunicazioni’ con la PA.

Comunicazioni
-------------

Le amministrazioni saranno in grado di inviare notifiche multicanale
(e-mail, notifiche PUSH, ecc.) ai cittadini che hanno sottoscritto un
particolare argomento di interesse (opt-in) sui portali PA e/o hanno
indicato uno o più recapiti per ricevere avvisi dalla Pubblica
Amministrazione (ad es. scadenze, pagamenti, cambiamenti di stato di una
pratica inoltrata).

Il cittadino interagisce con un unico servizio di gestione delle
preferenze (SGP); questo verrà interrogato dal sistema per l’invio delle
comunicazioni al fine di reperire i canali di inoltro preferito e gli
indirizzi di contatto del destinatario. Il cittadino non ha quindi
accesso diretto al sistema: i sistemi informativi delle parti coinvolte
nel servizio potranno inviare comunicazioni ai cittadini attraverso
l’API fornita.

Le amministrazioni avranno piena visibilità delle comunicazioni (e del
loro stato), limitatamente a quelle di cui sono esse stesse i mittenti.

Casi d'uso
~~~~~~~~~~~~~~~~~~

-  invio di promemoria (es. screening)
-  invio di scadenze (es. di un documento)
-  comunicazioni relative a nuove gare o contratti
-  comunicazioni scuola-famiglia
-  comunicazioni che contengono informazioni per pagamenti da effettuare
   tramite App od online (es. tributi ricorrenti, multe)
-  comunicazioni relative allo stato di un flusso di lavoro avviato per
   conto del cittadino (es. “pratica presa in carico”, “prenotazione
   accettata”) migliorando l’efficienza dei punti di contatto

Preferenze
----------

Il sistema di gestione delle preferenze (SGP) consente al cittadino di
gestire centralmente le impostazioni di personalizzazione relative ai
servizi digitali forniti dalla Pubblica Amministrazione. Per esempio:

-  Uno o più indirizzi per ricevere comunicazioni
-  Canali di comunicazione e tipologie di sottoscrizione
-  Metodi di pagamento preferiti (pagoPA)

Attraverso queste informazioni, SGP fornisce alle amministrazioni che lo
consultano l’opportunità di personalizzare i propri servizi digitali. I
cittadini non hanno accesso diretto al sistema: i sistemi di
amministrazione dell’amministrazione utilizzano l’API per accedere
(leggere) gli attributi gestiti dal SGP per conto dei cittadini che si
autenticano sui loro servizi digitali.

A chi si rivolge
----------------

Il sistema di avvisi e notifiche di cortesia si colloca tra
le `piattaforme abilitanti <https://pianotriennale-ict.readthedocs.io/it/latest/doc/04_infrastrutture-immateriali.html#piattaforme-abilitanti>`__
citate nel `Piano triennale per l'Infomatica nella Pubblica Amministrazione <https://pianotriennale-ict.italia.it/>`__.

Le amministrazioni potranno migliorare i propri servizi digitali
integrando (tramite le API) le funzionalità fornite dal sistema, 
al fine di veicolare i messaggi sui canali preferiti dai cittadini.
