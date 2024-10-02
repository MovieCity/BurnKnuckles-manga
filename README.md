# mangareader API

a simple and easy node js api to retrieve data including chapters images

## API Reference

#### base url

```http
https://mangareaderto-api.vercel.app/api/v1
```

#### Get trending

```http
  GET /trending
```

#### Get completed

```http
  GET /completed
```

#### get recommended

```http
  GET /recommended
```

#### get recommended

```http
  GET /recommended
```

#### get latest-updates

```http
  GET /latest-updates
```

#### get most-viewed

```http
  GET /most-viewed
```

#### get by genres and types

```http
  GET /all/:query/:category?sort=default&page=1
```

#### get by all completed new release top rated ect...

```http
  GET /all/:query?sort=default&page=1
```

#### get by search

```http
  GET /search?keyword=search_term
```

#### get get whole info

```http
  GET /info/:id"
```

#### get all chapters

```http
  GET /chapters/:id
```

#### response

```javascript

{
  "status": true,
  "totalPages": 205,
  "readingBy": "vol",
  "language": "en",
  "dataNumber": "2",
  "data": [
    {
      "url": "https://c-1.mreadercdn.com/_v2/0/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/ea/6b/ea6b5d418b670a5166c387a604d974be/ea6b5d418b670a5166c387a604d974be.jpg?t=515363393022bbd440b0b7d9918f291a&ttl=1908547557",
      "pageNumber": 1
    },
    {
      "url": "https://c-1.mreadercdn.com/_v2/0/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/33/a1/33a1bec494123021dcaf74fd25783113/33a1bec494123021dcaf74fd25783113.jpg?t=515363393022bbd440b0b7d9918f291a&ttl=1908547557",
      "pageNumber": 2
    },
    {
      "url": "https://c-1.mreadercdn.com/_v2/0/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/bf/71/bf71c64415559f4595819c005c7e24f4/bf71c64415559f4595819c005c7e24f4.jpg?t=515363393022bbd440b0b7d9918f291a&ttl=1908547557",
      "pageNumber": 3
    },
    {
      "url": "https://c-1.mreadercdn.com/_v2/0/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/56/9f/569f65a2e3ade657557ecba83a720ca1/569f65a2e3ade657557ecba83a720ca1.jpg?t=515363393022bbd440b0b7d9918f291a&ttl=1908547557",
      "pageNumber": 4
    },
    {
      "url": "https://c-1.mreadercdn.com/_v2/1/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/82/13/82137b0f45ee82621f99a749fd222043/82137b0f45ee82621f99a749fd222043_1900.jpeg?t=515363393022bbd440b0b7d9918f291a&ttl=1908547557&shuffled",
      "pageNumber": 5
    },

  ]
}
```

#### get chapters images

```http
  GET /read/:id/:lang/:chapterNumber
```
