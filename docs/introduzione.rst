Cittadinanza digitale
=====================

Introduzione
------------

L’iniziativa di Cittadinanza digitale mira ad agevolare la relazione tra
i cittadini e la Pubblica Amministrazione (PA) attraverso la creazione
di una piattaforma di componenti riutilizzabili in grado di rendere i
servizi digitali più efficaci e migliorare la comunicazione
tra i cittadini e la PA.

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
PA consentirà al cittadino di vivere l’esperienza
di Cittadinanza Digitale, portando con sè identità e informazioni,
trasversalmente ai diversi servizi.

Oltre ai componenti esistenti (pagoPA, SPID), AgID intende fornire
ulteriori servizi alle PA realizzando inizialmente le
componenti per la gestione delle preferenze
dei cittadini e per le comunicazioni tra i cittadini e la PA e
successivamente la componente per l'archiviazione e la gestione
dei documenti.

Comunicazioni
-------------

Le amministrazioni saranno in grado di inviare notifiche multicanale
(email, SMS, instant messagging, ecc.) ai cittadini che hanno
indicato uno o più recapiti per ricevere avvisi dalla PA
(ad es. scadenze, pagamenti, cambiamenti di stato di una
pratica inoltrata).

Il cittadino interagisce con un unico servizio di gestione delle
preferenze; questo verrà interrogato dal sistema per l’invio delle
comunicazioni al fine di reperire i canali di inoltro preferito e gli
indirizzi di contatto del destinatario.

Le amministrazioni avranno piena visibilità delle comunicazioni che
hanno inviato ad un cittadino (e del loro stato di invio e lettura).

Esempi di casi d'uso
~~~~~~~~~~~~~~~~~~

-  invio di promemoria (es. appuntamento medico)
-  invio di scadenze (es. scadenza della carta d'identità)
-  comunicazioni scuola-famiglia
-  comunicazioni che contengono informazioni per pagamenti (es. tributi, multe)
-  comunicazioni relative allo stato di una pratica (es. “pratica presa in carico”,
   “prenotazione accettata”).

Preferenze
----------

Il sistema di gestione delle preferenze consente al cittadino di
gestire centralmente le impostazioni di personalizzazione relative ai
servizi digitali forniti dalla PA. Per esempio:

-  Impostare uno o più indirizzi per ricevere comunicazioni digitali
-  Metodi di pagamento preferiti da utilizzare con pagoPA

Attraverso queste informazioni, le PA potranno personalizzare i propri servizi
digitali.

A chi si rivolge
----------------

Il sistema di avvisi e notifiche di cortesia si colloca tra
le `piattaforme abilitanti <https://pianotriennale-ict.readthedocs.io/it/latest/doc/04_infrastrutture-immateriali.html#piattaforme-abilitanti>`__
citate nel `Piano triennale per l'Infomatica nella Pubblica Amministrazione <https://pianotriennale-ict.italia.it/>`__.

Le amministrazioni potranno migliorare i propri servizi digitali
integrando (tramite le API) le funzionalità fornite dal sistema,
al fine di veicolare i messaggi sui canali preferiti dai cittadini.
