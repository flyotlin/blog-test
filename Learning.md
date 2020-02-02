* 利用不同路由Router，不同網址URL，由不同的Router(js)來負責

* app.js 24:30 放在 32:33 下面 logined username就會undefined
> https://stackoverflow.com/questions/51995873/why-is-req-session-undefined-when-i-am-checking-user-is-logged-in-so-that-i-can/51996086
* res.redirect 後面不能加ejs的參數
* 「依序」處理多個「非同步」 (Promise)