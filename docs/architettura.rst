Modello di funzionamento
========================

.. image:: https://raw.githubusercontent.com/teamdigitale/digital-citizenship-functions/master/docs/digital-citizenship-api.png
  :alt:

#. Il client API invia una richiesta (HTTPS) all'endpoint del servizio
#. L'endpoint inoltra la richiesta al gestore delle API (*API gateway*)
#. L'API gateway valida le credenziali (API-Key) fornite dal client ed effettua un *look up* dell'utenza associata alle credenziali
#. L'API gateway inoltra la richiesta e gli attributi associati all'utenza al backend che realizza la logica applicativa (*API Function*)
#. Il backend controlla che l'utenza abbia i necessari permessi per eseguire l'operazione (API) richiesta e la processa; la maggior parte delle richieste `CRUD <https://it.wikipedia.org/wiki/Tavola_CRUD>`__ interagisce con il database documentale (*DB*).
#. Se la richiesta riguarda la creazione di un nuovo messaggio [1]_ questo viene salvato sul database e inoltrato a una coda (*New Messages*) di processamento
#. Per ogni messaggio che giunge in coda, viene attivata una funzione che crea una *notifica* [2]_ associata al messaggio e la inoltra ad una ulteriore coda (*New Notifications*)
#. Per ogni notifica la funzione ricava le informazioni sui recapiti digitali del destinatario, identificato da un codice fiscale,  tramite profilo salvato sul database. Se l'utente ha abilitato la memorizzazione dei messaggi (*Inbox*) il contenuto del messaggio viene salvato in un file (*blob storage*) e potrà esser recuperato in qualsiasi momento.
#. Se il destinatario ha configurato nel proprio profilo uno o più recapiti digitali (es. indirizzo email, numero di telefono, dispositivo mobile),   la notifica viene inoltrata su una ulteriora coda (una per canale)
#. Per ogni notifica che giunge nella coda specifica per un certo canale viene attivata una funzione che la processa
#. La funzione interagisce con un endpoint specifico per quel canale di inoltro (es. un MTA, un API di terze parti, etc.) che invierà il contenuto al destinatario
#. Il risultato della chiamata è memorizzato nel database (*Notification*) e potrà essere recuperato tramite l'API per interrogare lo stato della notifica inoltrata

Registrazione al servizio e credenziali
---------------------------------------

*TODO*

Authentication of requests is handled by the Azure API Management service. Currently the system relies on a custom API token 
for authenticating clients. The token is transmitted in the HTTP request custom header Ocp-Apim-Subscription-Key and is tied to one user account belonging to an Organization.

Access rights to the resources is based on scopes. Each scope has a corresponding custom group in the Azure API Management service 
(e.g., the ProfileRead scope has a corresponding ProfileRead group).

Most resources have read and write scopes (e.g. ProfileRead, ProfileWrite).

API clients can be allowed to any scope by adding the client to the scope's group in the Azure API Management console 
(i.e., a client that is part of the ProfileRead and the ProfileWrite groups will have read and write rights on the profiles resource).

The currently supported scopes can be found in the Azure API Authentication middleware.

.. [1] Per *messaggio* si intende un contenuto testuale (titolo, corpo) associato a metadati che vengono salvati sul database.
.. [2] Per *notifica* si intende un messaggio inoltrato su uno dei canali associati al destinatario (es. email, push notification).
