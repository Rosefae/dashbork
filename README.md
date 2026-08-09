# dashbork
A system of dashboards that I'm probably gonna overthink and overengineer

## Requirements

Through NPM, all things are possible

## Future work

### 11ty

- Add postprocessing to move all style tags to head (order: widget, then board)
- When more than one instance of widget is on the board, somehow avoid unnecessary duplication of JS and styles?
- Add postprocessing to clean/minify the html/css/js

### Widgets to add

- Bus & Metro schedule
- Todoist integration
- Pull events from calendar(s)

Also update data pulls to first check local storage to see if it's been updated recently to gate most API requests to 1/minute (mostly so pupeteer uses to same data to generate the screenshots for all dashboards/devices)

### Other

Puppeteer can screenshot an element instead of the whole page so possible I can do something with that