Benefici del sistema di avvisi e preferenze
===========================================

Il sistema di avvisi e preferenze fornisce uno strumento
per tenere informati i cittadini, tramite i loro **canali di comunicazione preferiti**,
utilizzando indirizzi di recapito sempre aggiornati, in maniera trasparente
per le amministrazioni che utilizzano il servizio.

Tra gli obiettivi strategici si pone quindi l'incentivo all'utilizzo
dei canali digitali, più economici ed efficienti rispetto al cartaceo.

Cosa non va con l'email ?
-------------------------

L’email è senza dubbio il canale di comunicazione più popolare e utilizzato.
Tuttavia, alcuni limiti del protocollo `SMTP <https://it.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol>`__
rendono complessa l’implementazione di alcune funzionalità, o, laddove si realizzano tramite estensioni del protocollo, 
rimane difficile continuare a garantire un'esperienza utente (`UX <https://it.wikipedia.org/wiki/User_Experience>`__) efficace.

Ad esempio l'email:

- non certifica l'identità del mittente
- non integra l'autenticazione tramite `SPID <https://www.spid.gov.it>`__ per la lettura dei messaggi
- non certifica la consegna sul dispositivo del destinatario (nè tantomeno la lettura dei messaggi)
- è necessario integrare complessi meccanismi antispam / antivirus (lato gestore e lato utente)
- è poco adatta all'invio di informazioni strutturate che possano essere interpretate programmaticamente
  dai software di ricezione (es. *app mobile*)
- è poco adatta a condividere allegati di grandi dimensioni
  (è più "economico" inviare dei link agli allegati memorizzati altrove)
- generalmente, i server SMTP non forniscono un meccanismo per recuperare l'elenco e i metadati
  relativi a messaggi già inoltrati (destinatario, mittente, stato e ora dell'inoltro, ...)

Inoltre le PA non hanno accesso (tramite API) a un elenco degli indirizzi email associati ai cittadini.

Il sistema di avvisi non si pone l'obiettivo di sostituire l'email
(altresì utilizzata dal sistema, al pari degli altri mezzi di comunicazione),
ma di integrare i diversi canali con funzionalità sufficienti a risolvere i suddetti problemi,
continuando nel contempo a garantire un’**esperienza utente soddisfacente**.

Nuove possibilità per i Cittadini
---------------------------------

-  accedere all'archivio delle comunicazioni tramite SPID
-  gestire i contatti di recapito da un punto di accesso centrale (sito
   web & APP mobile italia.it)
-  gestire le sottoscrizioni (opt-in e opt-out) da un punto di accesso
   centrale
-  accedere alla cronologia delle comunicazioni da un punto di accesso
   centrale
-  effettuare semplici operazioni transazionali mediante gli avvisi
   ricevuti (es. pagamenti tramite pagoPA)

Nuove possibilità per le Amministrazioni
----------------------------------------

-  inviare comunicazioni elettroniche anche senza conoscere gli
   indirizzi di contatto dei cittadini, utilizzando solo il codice
   fiscale
-  delegare la gestione e l’aggiornamento dei contatti di consegna
   elettronica dei cittadini
-  dare maggiore visibilità alle proprie notifiche, laddove confluiscono
   in un contesto più ampio / nazionale
-  richiamare le scadenze e facilitare i pagamenti in modo semplice e
   sicuro
-  trasmettere gratuitamente comunicazioni multicanale (email, push
   notification)
-  recuperare lo stato di inoltro della comunicazione
   e di lettura del messaggio (laddove il canale lo consente)
