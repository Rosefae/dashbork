# dashbork
A system of dashboards that I'm probably gonna overthink and overengineer

## Requirements

Through NPM, all things are possible (version 26+ because Temporal)

## Technical details

### Node scripts

- `build`: builds the front-end (triggers an 11ty build)
- `watch`: watch for changes to 11ty files, then rebuild (no live reload)
- `serve`: spins up server
- `serveDev`: `build`, then concurrently `watch` and `serve`

### File Structure

```
|-- src (11ty source files for front-end)
  |-- common (assets shared by all boards/widgets)
    |-- fonts
    |-- images
    |-- common.css
    |-- wrapper.liquid
  |-- themes (theme-specific css)
    |-- {theme name}.css
  |-- boards (the main files for each dashboard)
    |-- {board name}.liquid (can be any extension that 11ty can handle)
  |-- widgets (different widgets that can be included as partials on different dashboards)
    |-- {widget name}.liquid
|-- scripts (server-side scripts)
  |-- data (scripts for the middle data layer to fetch data from various sources)
  |-- constants.js
  |-- utils.js
  |-- renderImage.js
  |-- server.js
  |-- watch.js (used to trigger a rebuild of the front-end during development)
|-- .eleventy.js
|-- .env (untracked; use for API keys)
|-- package.json
|-- package-lock.json
|-- README.md
```

### Env variables

```bash
PORT = 8080 # or whatever you want

STM_API_Key = API_KEY_GOES_HERE
CALENDARS = {...} # Stringified JSON of stuff needed for calendar data
TODOIST = {...} # Stringified JSON of user/API-key pairs
```

## Future work

### 11ty

- Add postprocessing to move all style tags to head (order: widget, then board)
- Add postprocessing to clean/minify the html/css/js

### Widgets to add

- Bus & Metro schedule
- Todoist integration
- Pull events from calendar(s)

### Other

- Puppeteer can screenshot an element instead of the whole page so possible I can do something with that
- Fonts: currently using ttf files downloaded from google fonts. Would be preferable to use woff2 instead