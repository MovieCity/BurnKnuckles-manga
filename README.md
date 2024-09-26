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

#### get chapters images

```http
  GET /read/:id/:lang/:chapterNumber
```
