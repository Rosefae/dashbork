# dashbork
A system of dashboards that I'm probably gonna overthink and overengineer

## Requirements

Through NPM, all things are possible (version 26+ because Temporal)

## Future work

### 11ty

- Add postprocessing to move all style tags to head (order: widget, then board)
- Add postprocessing to clean/minify the html/css/js

### Widgets to add

- Bus & Metro schedule
- Todoist integration
- Pull events from calendar(s)

### Bugfixes

- Data caching doesn't properly account for if there's multiple instances of a widget with different options / params / data needs
    - For Bixi: pull new data if querying a station not in cached data
    - For Weather: store `{lastFetched, data}` object under a `latitude,longitude` key, and update each such pair separately (will need boolean flag for whether to modify or overwrite json object)

### Other

Puppeteer can screenshot an element instead of the whole page so possible I can do something with that