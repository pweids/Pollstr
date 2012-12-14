#Pollstr
All done by me, Paul Weidinger (fweiding)

##Required Elements
1. _Javascript._ I have javascript all over the place. I use inheritance when I add functions to Array (Array.setAll on pollRoutes line 29)
2. _Canvas._ Did not use even a little bit
3. _HTML._ All over the place. I did use a templating engine, Jade. I have forms, divs, all sorts of stuff.
4. _CSS._ Also use a lot of CSS. Stylus and nib helped me make it easier and cross-platform. I have a reset, pseudo-selector, fixed & fluid layout, absolutely positioned stuff, mobily responsive stuff, etc.
5. _DOM Manipulation_ When adding candidates on /createPoll page, those lines are added AJAX-like with DOM manipulation.
6. _jQuery_ Try to find a place that I didn't use jQuery
7. _jQuery Mobile_ didn't need it
8. _PhoneGap_ also didn't need it
9. _AJAX (client)_
10. _AJAX (server)_ I use my server to provide an API that my client side uses. Best seen in moderate.js when ending a poll and vote.js when submitting a poll.
11. _node.js_ yes, and with express
12. _websockets_ wouldn't really make much sense here
13. _caching and localStorage_ wasn't needed. Stored everything in DB.
14. _Server-side database_ yep, MongoDB
15. _nodemailer_ used this to send emails :)
    
    
## Design Process
I got the opportunity to actually try out my app at one of my fraternity elections. I got some good feedback and got to work out some bugs. Mainly, the touch functionality wasn't working well or intuitively. Instead of having to drag at the icon, I made it so the entire bar could be dragged around.

For competitive analysis, there were a lot of survey like apps that had too many features and seemed like over kill.