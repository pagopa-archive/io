# [Digital Citizenship](https://teamdigitale.github.io/cittadinanza-digitale/)

## Introduction

The Digital Citizenship initiative aims to facilitate the relationship between citizens and the Public Administration through the creation of a platform of reusable components that can make digital services more effective and improve communication.

Digital services get build from core components that ensure a consistent user experience for the citizens and provide reusable building blocks for the public services.

<table>
<caption>
  Services and Digital Applications<br>
  Digital services of regional and national administrations and bodies<br>
  Vertical Application of Digital Citizenship<br>
</caption>
<thead>
<tr>
  <th>Identity</th>
  <th>Preferences</th>
  <th>Communications</th>
  <th>Financial Transactions</th>
  <th>Archive</th>
</tr>
</thead>
<tbody>
<tr>
  <td>Credentials and Personal Information (SPID)</td>
  <td>Horizontal personal preferences (eg Language) and vertical (of a specific service)</td>
  <td>Receive courtesy and lawful notifications</td>
  <td>Payments and credits (pagoPA)</td>
  <td>Digital archive of all documentation</td>
</tr>
</tbody>
</table>

The integration of the various components in the digital services provided by the Public Administration will enable the citizen to live the Digital Citizenship experience, bringing his identity and information transversely to the various performances.

In addition to existing components (pagoPA, SPID), AgID intends to provide other services to Public Administrations by realizing the components of Digital Citizenship in relation to the 'Preferences' of the citizens and the 'Communications' with the PA.

## Communications

Administrations will be able to submit multichannel notifications (SMS, E-mail, PUSH Notification, etc.) to citizens who have subscribed to a special topic of interest (opt-in) on PA portals, and/or have indicated one or more delivery contacts to receive alerts from the Public Administration (eg deadlines, payments, status changes of a forwarded practice, etc.).

The citizen interacts with a single preference management service (SGP) that will be queried by the SdA at the time of forwarding a notice to find the preferred forwarding channels and the recipient's contact addresses.
The citizen therefore has no direct access to the system: the information systems of the parties involved in the service will be able to send alerts to the citizens through the provided API.

### Related APIs

- [Notifications API](api/notifications.html)

## Preferences

The Preferences Management System (SGP) allows the citizen to centrally manage his personalization settings related to digital services provided by the Public Administration. Eg:

- One or more addresses to receive communications from the alert system
- Communication channels and subscription typologies (subscriptions)
- Preferred payment methods (pagoPA)

Through this information, SGP provides the consulting authorities with the opportunity to customize their digital services. Citizens do not have direct access to the system: administration information systems use the API to access (read) the attributes managed by the SGP on behalf of citizens authenticating on their digital services.

### Related APIs

- [Preferences API](api/preferences.html)

## Advantages

### For citizens

- Manage delivery contacts from a central access point (APP mobile and italia.it website)
- Manage subscriptions (opt-in and opt-out) from a central access point
- Access the communications history from a central access point
- Make simple transactional operations by means of notifications received (ie. payments)

### For administrations

- Send electronic communications even without knowing the contact addresses of citizens, using only their fiscal code
- Delegate the management and updating of citizens' electronic delivery contacts
- Give more visibility to your notifications, where they come together in a wider / national context
- Soliciting deadlines and facilitating payments in a simple and safe way
- Transmit multi-channel communications for free
- Assign status to communications (eg to track the status of a practice)
- Get the delivery status (sent, received) of the communication and possibly reading the message where the channel allows it

## API docs

- [Notifications API](api/notifications.html)
- [Preferences API](api/preferences.html)
