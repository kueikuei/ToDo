---
title: Todo Project
date: 2016-12-26 20:52:45
header-img: https://nodejs.org/static/images/logos/nodejs-new-pantone-black.png
tags:
- Javascript
- MAEN Stack
- Project
---

### 前言  
* ToDo介紹
* 套件安裝與環境設定
* 程式碼解釋

>app.js
>models/db.js
>routes/index.js
>views/all ejs

* push to heroku
* 參考資料
* 程式碼下載

### ToDo介紹
1. 瞭解一個web app應用最基礎的方式無非是直接去寫一個project，儘管內容不是多高級的技術，卻含括了最基本的CRUD等功能。
2. 而此app透過MAEN Stack方式，結合MongoDB、Angular、Express、NodeJS建立一款線上備忘錄App。
3. MEAN Stack主要檔案結構如下：

ToDo
>bin
>>www

>models
>>db.js

>public
>>src
>>>bower_component
>>>stylesheets

>routes
>>index.js

>src

>views
>>.ejs

>app.js

>bower.json

>package.json

### 套件安裝與環境設定
* 特別套件

>mongoose:用`Schema`定義了一個`collection`的結構，加上其他對這個 collection 的驗證設定、操作方法等等，便構成了一個`Model`
>express-generator:前端鷹架，類似rails
>nodemon:前端即時監聽程式碼
>>開啟local server`$ nodemon server.js localhost:3000`

>body-parse:讀取前端body內的資訊

* 安裝順序
1. MongoDB安裝
`$ brew install mongodb`
[詳細安裝過程點此](https://kueiblog.herokuapp.com/post/MongoDB/)

2. 使用express-generator產生專案
`$ express -e examples`

3. 安裝相關套件
`$ sudo npm install express-generator nodemon -g`
`$ sudo npm install`
`$ bower install --save 'bootstrap' 'jquery'`


### 程式碼解釋

* app.js
作為一彙整檔，將所有`modules`與重要file(例如`routes`)引入。

* models/db.js
1. 連結資料庫(MongoDB)
   local端:`mongoose.connect('mongodb://localhost/todoapp')`，todoapp為db名稱
也可以透過雲端MongoDB服務mLab將資料塞在雲端
   mLab:`var dbURI = mongodb://<dbuser>:<dbpassword>@ds145868.mlab.com:45868/todo`;最後做連結`mongoose.connect(dbURI)`

2. 透過mongoose建立起ToDo Schema
這邊只用到title與date
```json
const TodoSchema = { 
  title: String,
  date: { type: Date, default: Date.now() },
};
```

3. 透過mongoose建立起Model並將資料表(collection)取名為Todo
將其module.exports後可以讓其他file去`require`並使用此model與資料庫做互動
`module.exports = mongoose.model('Todo', TodoSchema);`

* routes/index.js
route作為引入各種路徑至某網頁，可說是`Express`最方便與厲害的地方。
透過var router = `express.Router()`去取得router後便可以輕易做到各種route的引用。

在CRUD中最重要的不外乎是`讀取(Read)`資料與`產生(Create)`資料
而相對應的`動作(method)`則是`get`與`post`
express透過`router.get`與`router.post`等方法可以輕易達到效果

先來介紹`讀取(Read)`
```javascript
router.get('/', function(req, res, next) {
  Todo.find({}, function(error, todos) {
    res.render('index', { title: 'TodoApp', todos: todos });
  });
});
```
瀏覽器得到`/`請求(`request`)後便會導入此匿名function中，分別會有三個參數`req, res, next`ㄎ接著就能透過這些參數做事情。首先，這邊透過`Todo model`去取得所有資料，MongoDB對應指令則是`find({})`，取得後再接一匿名function去做接下來的事情，假若error則能透過next(err)去處理，而這邊假設會成功，成功後得到參數`todos`，此其時就是所有資料的集合，並用`json`的方式傳入，後續透過`res.render`，此為引用`ejs 模板`並將資料傳入得模板中，這邊只簡單提到，後續會做更近一步說明。

`產生(Create)`
```javascript
router.post('/create', function(req, res, next) {
  // console.log(req.body);//{ title: '打電動' }
  new Todo({
    title: req.body.title,
  }).save(function(error) {
    res.redirect( '/' );
  });
});
```
與`get`其實程式很像對吧？主要差異在於method改用`post`，在這邊不再是讀取資料而是產生資料，故透過`new Todo`去產生一筆新資料，這邊比較特別的是`req.body.title`，此為將前端表單輸入的資料讀取進來，由於express無法進行body的解析，故前面require此模組`body-parser`後就可以引入，而這邊讓我們先跳到`前端表單ejs`部分進行解釋。

``` html
<form method="post" action="/create">
    <label>代辦事項：</label>
    <!-- 透過name取得資料 -->
    <input class="form-control" type="text" name="title" required placeholder="請輸入代辦事項">
    <br>
    <button class="btn btn-primary btn-block" type="submit">提交</button>     
</form>
```
要特別注意的是表單的method要用`post`;`action`採用`"/create"`如此便能對應到應屬的route

成功建立資料進行儲存動作`.save`，沒有意外則會儲存並導入到`首頁(/)`

`更新(Update)`
提到更新資料一定要提到route裡的`subredditName`。subredditName讓我們的route更加有擴充性，概念是將輸入的網址當作變數去使用，使用方式為加上`:`，例如網址列打`/:id/:title`後，透過req.params會得到：

```javascript
//multi params
req.params=
{
    id:'1',
    title:'sports'
}
```

所以要取出其中的值就按照物件方式`req.params.id`以及`req.params.title`

而在ToDo app中，如果要編輯資料則是先點選要更改的資料，route藉由`/todos/:id`導入到`todo.ejs`，完整程式碼如下：
```javascript
router.get('/todos/:id', function(req, res, next) {
  // console.log(req.params.id);
  Todo.findById(req.params.id, function(error, todo){
    res.render('todo', { title: 'TodoApp', todo: todo });
  });
});
```
步驟大致都跟`create`時類似，要注意的是前端的小技巧部分，這邊來看看前端的寫法
```html
<table class="table table-striped">
    <tr>
        <th>代辦事項名稱</th>
        <th>記錄時間</th> 
    </tr>
    <% for(var i = 0; i < todos.length; i++) { %>
    <tr>
        <td><a href="/todos/<%= todos[i].id %>"><span><%= todos[i].title %></span></a></td>
        <td><span><%= todos[i].date %></span></td>
    </tr> 
    <% } %>
</table>
```
這邊透過ejs的前端邏輯去進行`for loop`將從`router.get('/')`拿到的`todos`資料全部run過一遍並且呈現在前端interface上
```json
//todos資料為object
todos=
[ 
  { _id: 587af425f82029c9f8814179,
    title: '吃午餐',
    __v: 0,
    date: Sun Jan 15 2017 12:01:27 GMT+0800 (CST) },
  { _id: 587b10e9b57224e3e72dd6a4,
    title: '打程式',
    __v: 0,
    date: Sun Jan 15 2017 15:02:15 GMT+0800 (CST) } 
]
```
值得注意的是在塞資料的過程中取出各個資料的id`todos[i].id`並塞進超連結`href`中，於是當點擊某筆資料時能連結到他的id name route外，更能順便將網址的data取出拿來運用，真是個聰明方式!!

進入到todo.ejs後真正要開始`update`與`delete`。
點擊`修改`button後，route導入到`/todos/:id/edit`並render `edit.ejs`，一但修改完資料後按出`送出修改`bitton，route導入到`/edit`，要注意的是，和`create`時一樣，這邊的方法一樣用`post`，接著就會去DB尋找此筆資料，然而，很重要的一點是，如何得知是哪比資料呢？前面用`req.params.id`去搜尋資料，然而別忘記，此刻所導入的route是`/edit`，故這邊透過`req.body.id`進行資料的搜尋，這邊又要提到前端的小技巧，將value偷偷塞入`<input>`tag中的value裡頭，如下：
```html
<input type="hidden" name="id" value="<%= todo.id %>">
```
便能透過req.body.id去取得資料。

故這邊逐一將title與date做更改，完整程式碼如下：
```javascript
router.post('/edit', function(req, res, next) {
  Todo.findById(req.body.id, function(error, todo){
    todo.title = req.body.title;
    todo.date = Date.now();
    todo.save(function(error) {
      res.redirect( '/' );
    });
  });
});
```

刪除部分則是用`remove()`去執行`todo.remove()`，完整程式碼如下：
```javascript
router.post('/delete', function(req, res, next) {
  Todo.findById(req.body.id, function(error, todo){
    todo.remove(function(error, todo){
      res.redirect( '/' );
    });
  });
});
```

前端action此刻為`action="/delete"`，完整程式碼如下：

```html
<form method="post" action="/delete">
    <input type="hidden" name="id" value="<%= todo.id %>">
    <button class="btn btn-danger btn-lg" type="submit">刪除</button>          
</form>
```

如此便完成所有關於`CRUD`程式碼部分的介紹。

* views/all ejs
前面其實已經有說到許多關於`ejs`在裡頭的運用
透過render去使用ejs，並能將資料以`json`方式傳入前端
ejs與javascript對應如下：

*javascript*
```javascript
Todo.find({}, function(error, todos) {
    res.render('index', { title: 'TodoApp', todos: todos });
});
```

*ejs*
```html
<h1><%= title %></h1>

<% for(var i｀ = 0; i < todos.length; i++) { %>
    <tr>
        <td><a href="/todos/<%= todos[i].id %>"><span><%= todos[i].title %></span></a></td>
        <td><span><%= todos[i].date %></span></td>
    </tr> 
<% } %>
```

### push to heroku
比較需要特別注意的是在`package`的安裝部分是否有順利在heroku上安裝成功。

### 參考資料
[MongoDB的ODM：mongoose 簡單介紹](http://blog.chh.tw/posts/mongodb-odm-mongoose/)
[用Express和MongoDB寫一個todo list](http://dreamerslab.com/blog/tw/write-a-todo-list-with-express-and-mongodb/)

### 程式碼下載
<a href="https://www.google.com">
<button type="button" style="background-color:#008CBA;color:white;border-radius:8px;border:none">GitHub 下載</button>
</a>





